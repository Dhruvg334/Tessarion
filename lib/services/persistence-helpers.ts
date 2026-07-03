import { ExtractedConcept, ExtractedRelationship } from '../ai/types';
import { createServiceClient } from '@/lib/supabase/service';
import { AppError } from '@/lib/errors/app-error';
import { calculateDeterministicLayout } from '../graph/layout';
import { ConceptNode } from '@/types/database';

function normalizeConceptName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Upserts concept nodes. Returns a map of normalized original name -> new node ID.
 */
export async function upsertConceptNodes(
  workspaceId: string,
  userId: string,
  concepts: ExtractedConcept[]
): Promise<Map<string, string>> {
  // Service role is used here because node/edge persistence can happen in background workers
  // (like Inngest) where cookies() are not available, and for batch upserting across RLS.
  // We explicitly verify workspace ownership before proceeding.
  const supabase = createServiceClient();

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (wsError || !workspace) {
    throw new AppError('UNAUTHORIZED', 403, 'Workspace ownership verification failed');
  }

  const nameToId = new Map<string, string>();

  // Fetch existing concepts in the workspace to merge
  const { data: existingNodes, error: fetchError } = await supabase
    .from('concept_nodes')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (fetchError) throw new AppError('DB_ERROR', 500, fetchError.message);

  const existingMap = new Map((existingNodes || []).map(n => [normalizeConceptName(n.name), n]));
  const nodesToUpsert = [];

  for (const concept of concepts) {
    const normalizedName = normalizeConceptName(concept.name);
    const existing = existingMap.get(normalizedName);

    if (existing) {
      // Merge
      const newSourceChunkIds = Array.from(new Set([...(existing.source_chunk_ids || []), ...concept.sourceChunkIds]));
      nodesToUpsert.push({
        ...existing,
        // Only overwrite definition if new one is 'stronger' (longer/better), naive approach:
        definition: existing.definition?.length && existing.definition.length > concept.definition.length 
          ? existing.definition 
          : concept.definition,
        source_chunk_ids: newSourceChunkIds,
        confidence_score: Math.max(existing.confidence_score || 0, concept.confidenceScore),
        updated_at: new Date().toISOString(),
      });
      nameToId.set(normalizedName, existing.id);
    } else {
      // Create new
      const id = crypto.randomUUID();
      nodesToUpsert.push({
        id,
        workspace_id: workspaceId,
        name: concept.name,
        definition: concept.definition,
        source_chunk_ids: concept.sourceChunkIds,
        mastery_level: 'untested',
        mastery_score: 0,
        teach_back_count: 0,
        gap_count: 0,
        confidence_score: concept.confidenceScore,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      nameToId.set(normalizedName, id);
    }
  }

  // Recalculate deterministic layout positions before upsert
  const layoutedNodes = calculateDeterministicLayout(nodesToUpsert as unknown as ConceptNode[]);

  if (layoutedNodes.length > 0) {
    const { error: upsertError } = await supabase
      .from('concept_nodes')
      .upsert(layoutedNodes);
    
    if (upsertError) throw new AppError('DB_ERROR', 500, upsertError.message);
  }

  return nameToId;
}

export async function upsertConceptEdges(
  workspaceId: string,
  userId: string,
  relationships: ExtractedRelationship[],
  nodeIdsMap: Map<string, string>
) {
  // Service role is used for background compatibility.
  // Ownership is verified in upsertConceptNodes, but we fetch existing edges safely within the workspace.
  const supabase = createServiceClient();

  const { data: existingEdges, error: fetchError } = await supabase
    .from('concept_edges')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (fetchError) throw new AppError('DB_ERROR', 500, fetchError.message);

  const existingMap = new Map();
  for (const edge of (existingEdges || [])) {
    const key = `${edge.source_node_id}-${edge.target_node_id}-${edge.relationship_type}`;
    existingMap.set(key, edge);
  }

  const edgesToInsert = [];
  const edgesToUpdate = [];

  for (const rel of relationships) {
    const sourceId = nodeIdsMap.get(normalizeConceptName(rel.sourceNodeName));
    const targetId = nodeIdsMap.get(normalizeConceptName(rel.targetNodeName));

    if (sourceId && targetId && sourceId !== targetId) {
      const key = `${sourceId}-${targetId}-${rel.relationshipType}`;
      const existing = existingMap.get(key);

      if (existing) {
        const newSourceChunkIds = Array.from(new Set([...(existing.source_chunk_ids || []), ...rel.sourceChunkIds]));
        edgesToUpdate.push({
          ...existing,
          source_chunk_ids: newSourceChunkIds,
          confidence_score: Math.max(existing.confidence_score || 0, rel.confidenceScore),
        });
        // Update map so we don't process same duplicate twice
        existingMap.set(key, edgesToUpdate[edgesToUpdate.length - 1]);
      } else {
        const newEdge = {
          id: crypto.randomUUID(),
          workspace_id: workspaceId,
          source_node_id: sourceId,
          target_node_id: targetId,
          relationship_type: rel.relationshipType,
          description: rel.description,
          source_chunk_ids: rel.sourceChunkIds,
          confidence_score: rel.confidenceScore,
          created_at: new Date().toISOString(),
        };
        edgesToInsert.push(newEdge);
        existingMap.set(key, newEdge);
      }
    }
  }

  if (edgesToUpdate.length > 0) {
    const { error: updateError } = await supabase
      .from('concept_edges')
      .upsert(edgesToUpdate);
      
    if (updateError) throw new AppError('DB_ERROR', 500, updateError.message);
  }

  if (edgesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('concept_edges')
      .insert(edgesToInsert);
    
    if (insertError) throw new AppError('DB_ERROR', 500, insertError.message);
  }
}
