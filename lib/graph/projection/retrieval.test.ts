import { describe, expect, it } from 'vitest';
import type { HybridCandidate } from '@/lib/rag/hybrid/types';
import { LocalGraphProjectionStore } from './local-store';
import { augmentRetrievalWithGraph } from './retrieval';

describe('augmentRetrievalWithGraph', () => {
  it('boosts only chunks supported by bounded graph paths', async () => {
    const store = new LocalGraphProjectionStore();
    await store.replaceWorkspaceProjection({
      workspaceId: 'workspace-a',
      version: 'v1',
      generatedAt: '2026-07-25T00:00:00.000Z',
      nodes: [
        { id: 'arrays', workspaceId: 'workspace-a', name: 'Arrays', sourceChunkIds: [], updatedAt: '2026-07-25T00:00:00.000Z' },
        { id: 'memory', workspaceId: 'workspace-a', name: 'Memory', sourceChunkIds: [], updatedAt: '2026-07-25T00:00:00.000Z' },
      ],
      edges: [{
        id: 'edge-1',
        workspaceId: 'workspace-a',
        sourceConceptId: 'memory',
        targetConceptId: 'arrays',
        relationshipType: 'prerequisite',
        strength: 0.9,
        confidence: 0.95,
        sourceChunkIds: ['chunk-graph'],
        createdAt: '2026-07-25T00:00:00.000Z',
      }],
    });

    const result = await augmentRetrievalWithGraph({
      candidates: [candidate('chunk-other', 0.3), candidate('chunk-graph', 0.29)],
      graphQuery: { workspaceId: 'workspace-a', seedConceptIds: ['arrays'], maxDepth: 1 },
    }, store);

    expect(result.candidates[0]?.id).toBe('chunk-graph');
    expect(result.diagnostics.graphBoostedCandidateCount).toBe(1);
  });
});

function candidate(id: string, fusionScore: number): HybridCandidate {
  return {
    id,
    sourceDocumentId: 'document-a',
    workspaceId: 'workspace-a',
    content: id,
    chunkIndex: 0,
    tokenCount: 10,
    confidence: 0.5,
    fusionScore,
  };
}
