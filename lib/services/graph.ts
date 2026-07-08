import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { calculateGraphMetrics, GraphMetrics } from '../graph/metrics';
import { ConceptNode, ConceptEdge } from '@/types/database';
import { MasteryState } from '../mastery/types';

export interface NodeMasteryData {
  mastery_level: MasteryState;
  mastery_score: number;
  confidence_score: number;
  evidence_count: number;
  attempts_count: number;
  recommendation_label: string;
}

export type GraphNode = ConceptNode & { mastery: NodeMasteryData | null };

export interface WorkspaceGraph {
  nodes: GraphNode[];
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
    throw new AppError('Workspace not found', 404, 'NOT_FOUND');
  }

  const { data: nodes, error: nodeError } = await supabase
    .from('concept_nodes')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (nodeError) throw new AppError('Failed to load concept nodes', 500, 'DB_ERROR');

  const { data: edges, error: edgeError } = await supabase
    .from('concept_edges')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (edgeError) throw new AppError('Failed to load concept edges', 500, 'DB_ERROR');

  const nodeIds = (nodes || []).map(n => n.id);
  const masteryMap = new Map<string, NodeMasteryData>();

  if (nodeIds.length > 0) {
    const { data: masteries } = await supabase
      .from('mastery_records')
      .select('concept_node_id, mastery_level, mastery_score, confidence_score, evidence_count, attempts_count, recommendation_label')
      .in('concept_node_id', nodeIds);

    if (masteries) {
      masteries.forEach(m => {
        masteryMap.set(m.concept_node_id, {
          mastery_level: m.mastery_level as MasteryState,
          mastery_score: m.mastery_score || 0,
          confidence_score: m.confidence_score || 0,
          evidence_count: m.evidence_count || 0,
          attempts_count: m.attempts_count || 0,
          recommendation_label: m.recommendation_label || '',
        });
      });
    }
  }

  const enrichedNodes: GraphNode[] = (nodes || []).map(n => ({
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
