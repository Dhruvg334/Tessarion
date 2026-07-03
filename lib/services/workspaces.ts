import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
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

  if (error || !data) throw new Error('Workspace not found or unauthorized');
  return data as Workspace;
}

export async function createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<Workspace> {
  const serviceClient = createServiceClient();
  
  // Safe Profile Repair Path
  // Check if profile exists, if not, create it to satisfy foreign key constraint.
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!profile) {
    const { data: userAuth, error: authErr } = await serviceClient.auth.admin.getUserById(userId);
    if (!authErr && userAuth?.user) {
      await serviceClient.from('profiles').insert({
        id: userId,
        email: userAuth.user.email || 'unknown@example.com',
        display_name: userAuth.user.email?.split('@')[0] || 'User',
      });
    }
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to insert workspace:', error);
    throw error;
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
