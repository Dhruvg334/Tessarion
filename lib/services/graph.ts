import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { calculateGraphMetrics, GraphMetrics } from '../graph/metrics';
import { ConceptNode, ConceptEdge } from '@/types/database';

export interface WorkspaceGraph {
  nodes: (ConceptNode & { mastery?: any })[];
  edges: ConceptEdge[];
  metrics: GraphMetrics;
}

export async function getWorkspaceGraph(workspaceId: string, userId: string): Promise<WorkspaceGraph> {
  const supabase = await createServerSupabaseClient();
  
  // Verify workspace
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (wsError || !workspace) {
    throw new AppError('NOT_FOUND', 404, 'Workspace not found');
  }

  const { data: nodes, error: nodeError } = await supabase
    .from('concept_nodes')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (nodeError) throw new AppError('DB_ERROR', 500, nodeError.message);

  const { data: edges, error: edgeError } = await supabase
    .from('concept_edges')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (edgeError) throw new AppError('DB_ERROR', 500, edgeError.message);

  const nodeIds = (nodes || []).map(n => n.id);
  const { data: masteries } = await supabase
    .from('mastery_records')
    .select('*')
    .in('concept_node_id', nodeIds);

  const masteryMap = new Map();
  if (masteries) {
    masteries.forEach(m => masteryMap.set(m.concept_node_id, m));
  }

  const enrichedNodes = (nodes || []).map(n => ({
    ...n,
    mastery: masteryMap.get(n.id) || null
  }));

  const metrics = calculateGraphMetrics(nodes || [], edges || []);

  return {
    nodes: enrichedNodes,
    edges: edges || [],
    metrics,
  };
}
