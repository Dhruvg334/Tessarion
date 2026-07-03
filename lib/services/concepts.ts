import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { ConceptNode } from '@/types/database';

export async function listConcepts(workspaceId: string, userId: string): Promise<ConceptNode[]> {
  const supabase = await createServerSupabaseClient();
  
  // Verify workspace ownership implicitly via RLS or explicit check
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (wsError || !workspace) {
    throw new AppError('NOT_FOUND', 404, 'Workspace not found');
  }

  const { data, error } = await supabase
    .from('concept_nodes')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name');

  if (error) throw new AppError('DB_ERROR', 500, error.message);
  return data || [];
}
