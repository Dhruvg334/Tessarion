import { describe, expect, it } from 'vitest';
import type { ConceptEdge, ConceptNode } from '@/types/database';
import { buildWorkspaceGraphProjection } from './types';

describe('buildWorkspaceGraphProjection', () => {
  it('rejects ungrounded, cross-workspace and missing-endpoint edges', () => {
    const nodes = [conceptNode('a'), conceptNode('b')];
    const edges = [
      conceptEdge('valid', 'a', 'b', ['chunk-1']),
      conceptEdge('ungrounded', 'a', 'b', []),
      conceptEdge('missing', 'a', 'missing', ['chunk-2']),
      { ...conceptEdge('cross', 'a', 'b', ['chunk-3']), workspace_id: 'workspace-b' },
    ];

    const result = buildWorkspaceGraphProjection('workspace-a', nodes, edges, 'v1');

    expect(result.projection.edges.map((edge) => edge.id)).toEqual(['valid']);
    expect(result.rejectedEdges).toEqual(expect.arrayContaining([
      { edgeId: 'ungrounded', reason: 'UNGROUNDED_EDGE' },
      { edgeId: 'missing', reason: 'MISSING_ENDPOINT' },
      { edgeId: 'cross', reason: 'CROSS_WORKSPACE_EDGE' },
    ]));
  });
});

function conceptNode(id: string): ConceptNode {
  return {
    id,
    workspace_id: 'workspace-a',
    name: id,
    definition: null,
    source_chunk_ids: [`chunk-${id}`],
    mastery_level: null,
    mastery_score: 0,
    blooms_level_achieved: null,
    last_teach_back_at: null,
    next_review_at: null,
    teach_back_count: 0,
    gap_count: 0,
    confidence_score: null,
    cluster_label: null,
    dependency_depth: null,
    position_x: null,
    position_y: null,
    created_at: '2026-07-25T00:00:00.000Z',
    updated_at: '2026-07-25T00:00:00.000Z',
  };
}

function conceptEdge(id: string, source: string, target: string, chunks: string[]): ConceptEdge {
  return {
    id,
    workspace_id: 'workspace-a',
    source_node_id: source,
    target_node_id: target,
    relationship_type: 'prerequisite',
    strength: 0.8,
    description: null,
    source_chunk_ids: chunks,
    confidence_score: 0.9,
    created_at: '2026-07-25T00:00:00.000Z',
  };
}
