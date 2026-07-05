import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { serverEnv } from '@/lib/config/env';
import { AppError } from '@/lib/errors/app-error';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '@/lib/validation/schemas';
import { Workspace } from '@/types/database';

export async function listWorkspaces(userId: string): Promise<Workspace[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Workspace[];
}

export async function getWorkspace(workspaceId: string, userId: string): Promise<Workspace> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new AppError('Workspace not found or unauthorized', 404, 'WORKSPACE_NOT_FOUND');
  return data as Workspace;
}

async function repairProfile(userId: string) {
  if (!serverEnv.supabaseServiceRoleKey) {
    throw new AppError('Workspace creation is not configured. Check SUPABASE_SERVICE_ROLE_KEY.', 500, 'MISSING_SERVICE_ROLE');
  }

  const serviceClient = createServiceClient();
  const { data: userAuth, error: authErr } = await serviceClient.auth.admin.getUserById(userId);
  
  if (authErr || !userAuth?.user) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Profile repair failed: user not found in auth.users', authErr?.message);
    }
    throw new AppError('Failed to verify user account during workspace creation.', 500, 'USER_NOT_FOUND');
  }

  const { error: upsertError } = await serviceClient.from('profiles').upsert({
    id: userId,
    email: userAuth.user.email || 'unknown@example.com',
    display_name: userAuth.user.email?.split('@')[0] || 'User',
  }, { onConflict: 'id' });

  if (upsertError) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Profile repair upsert failed:', upsertError.message);
    }
    throw new AppError('Failed to complete account setup.', 500, 'PROFILE_REPAIR_FAILED');
  }
}

async function insertWorkspace(userId: string, input: CreateWorkspaceInput) {
  const supabase = await createServerSupabaseClient();
  return supabase
    .from('workspaces')
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description || null,
    })
    .select()
    .single();
}

export async function createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<Workspace> {
  let result = await insertWorkspace(userId, input);

  if (result.error) {
    if (result.error.code === '23503' && result.error.message.includes('profiles')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Workspace insert failed due to missing profile FK (23503). Attempting repair.');
        console.warn(`Service role key configured: ${!!serverEnv.supabaseServiceRoleKey}`);
      }
      
      // Attempt repair for the currently authenticated user
      await repairProfile(userId);
      
      // Retry once
      result = await insertWorkspace(userId, input);
      
      if (result.error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Workspace insert failed after repair:', { code: result.error.code, message: result.error.message, details: result.error.details });
        }
        throw new AppError('Failed to create workspace after account repair', 500, 'WORKSPACE_CREATE_FAILED');
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('Workspace insert failed:', { code: result.error.code, message: result.error.message, details: result.error.details });
      }
      throw new AppError('Failed to create workspace', 500, 'WORKSPACE_CREATE_FAILED');
    }
  }

  return result.data as Workspace;
}

export async function updateWorkspace(workspaceId: string, userId: string, input: UpdateWorkspaceInput): Promise<Workspace> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('workspaces')
    .update(input)
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Workspace;
}

export async function archiveWorkspace(workspaceId: string, userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('workspaces')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', workspaceId)
    .eq('user_id', userId);

  if (error) throw error;
}
