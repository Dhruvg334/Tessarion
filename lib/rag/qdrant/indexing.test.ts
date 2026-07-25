import { describe, expect, it } from 'vitest';
import { localProvider } from '@/lib/ai/providers/local';
import { buildQdrantChunkPoints } from './indexing';

const chunk = {
  id: 'chunk-1', sourceDocumentId: 'doc-1', workspaceId: 'ws-1', content: 'A stack follows last in, first out.',
  chunkIndex: 0, tokenCount: 8, confidence: 1,
};

describe('Qdrant indexing contract', () => {
  it('creates deterministic, workspace-scoped points', async () => {
    const first = await buildQdrantChunkPoints([chunk], localProvider, 'local-v1', '2026-07-25T00:00:00.000Z');
    const second = await buildQdrantChunkPoints([chunk], localProvider, 'local-v1', '2026-07-25T00:00:00.000Z');
    expect(first[0].id).toBe(second[0].id);
    expect(first[0].payload.workspaceId).toBe('ws-1');
    expect(first[0].vector.dense).toHaveLength(768);
    expect(first[0].vector.sparse.indices.length).toBeGreaterThan(0);
  });
});
