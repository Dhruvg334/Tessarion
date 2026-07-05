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

async function ensureCurrentUserProfile(userId: string) {
  if (!serverEnv.supabaseServiceRoleKey) {
    return;
  }

  const serviceClient = createServiceClient();
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.warn('Profile lookup failed before workspace creation:', profileError.message);
    return;
  }

  if (profile) return;

  const { data: userAuth, error: authErr } = await serviceClient.auth.admin.getUserById(userId);
  if (authErr || !userAuth?.user) {
    console.warn('Could not repair profile before workspace creation:', authErr?.message || 'user not found');
    return;
  }

  const { error: upsertError } = await serviceClient.from('profiles').upsert({
    id: userId,
    email: userAuth.user.email || 'unknown@example.com',
    display_name: userAuth.user.email?.split('@')[0] || 'User',
  }, { onConflict: 'id' });

  if (upsertError) {
    console.warn('Profile repair upsert failed before workspace creation:', upsertError.message);
  }
}

export async function createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<Workspace> {
  await ensureCurrentUserProfile(userId);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Workspace insert failed:', { code: error.code, message: error.message, details: error.details });
    throw new AppError('Failed to create workspace', 500, 'WORKSPACE_CREATE_FAILED');
  }

  return data as Workspace;
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
