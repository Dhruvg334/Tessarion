import { describe, expect, it } from 'vitest';
import { LocalGraphProjectionStore } from './local-store';
import type { WorkspaceGraphProjection } from './types';

const projection: WorkspaceGraphProjection = {
  workspaceId: 'workspace-a',
  version: 'v1',
  generatedAt: '2026-07-25T00:00:00.000Z',
  nodes: [
    node('arrays', 'Arrays'),
    node('memory', 'Contiguous memory'),
    node('indexing', 'Index access'),
    node('linked', 'Linked lists'),
  ],
  edges: [
    edge('e1', 'memory', 'arrays', 'prerequisite', ['chunk-memory']),
    edge('e2', 'arrays', 'indexing', 'causal', ['chunk-indexing']),
    edge('e3', 'arrays', 'linked', 'contrasts', ['chunk-comparison']),
  ],
};

describe('LocalGraphProjectionStore', () => {
  it('enforces bounded traversal and preserves evidence provenance', async () => {
    const store = new LocalGraphProjectionStore();
    await store.replaceWorkspaceProjection(projection);

    const result = await store.traverse({
      workspaceId: 'workspace-a',
      seedConceptIds: ['arrays'],
      direction: 'both',
      maxDepth: 1,
      maxNodes: 3,
    });

    expect(result.nodes).toHaveLength(3);
    expect(result.truncated).toBe(true);
    expect(result.paths.every((path) => path.depth <= 1)).toBe(true);
    expect(result.paths.flatMap((path) => path.evidenceChunkIds)).toContain('chunk-memory');
  });

  it('returns no data across workspace boundaries', async () => {
    const store = new LocalGraphProjectionStore();
    await store.replaceWorkspaceProjection(projection);

    const result = await store.traverse({
      workspaceId: 'workspace-b',
      seedConceptIds: ['arrays'],
    });

    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });
});

function node(id: string, name: string) {
  return {
    id,
    workspaceId: 'workspace-a',
    name,
    sourceChunkIds: [`chunk-${id}`],
    updatedAt: '2026-07-25T00:00:00.000Z',
  };
}

function edge(
  id: string,
  sourceConceptId: string,
  targetConceptId: string,
  relationshipType: 'prerequisite' | 'related' | 'contrasts' | 'causal',
  sourceChunkIds: string[],
) {
  return {
    id,
    workspaceId: 'workspace-a',
    sourceConceptId,
    targetConceptId,
    relationshipType,
    strength: 0.9,
    confidence: 0.95,
    sourceChunkIds,
    createdAt: '2026-07-25T00:00:00.000Z',
  };
}
