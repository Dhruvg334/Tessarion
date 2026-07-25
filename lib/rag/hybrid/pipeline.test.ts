import { describe, expect, it } from 'vitest';
import { localProvider } from '@/lib/ai/providers/local';
import { LocalDenseRetriever, LocalSparseRetriever } from './local-retrievers';
import { retrieveHybridContext } from './pipeline';
import { DeterministicHybridReranker } from './rerank';
import type { RetrievedChunk } from '../types';

const chunks: RetrievedChunk[] = [
  { id: 'a', sourceDocumentId: 'doc', workspaceId: 'ws', content: 'Arrays use contiguous memory and direct index access.', chunkIndex: 0, tokenCount: 8, confidence: 1 },
  { id: 'b', sourceDocumentId: 'doc', workspaceId: 'ws', content: 'Linked lists connect nodes through references.', chunkIndex: 1, tokenCount: 7, confidence: 1 },
  { id: 'c', sourceDocumentId: 'doc', workspaceId: 'other', content: 'Arrays use contiguous memory.', chunkIndex: 0, tokenCount: 4, confidence: 1 },
];

describe('hybrid retrieval pipeline', () => {
  it('enforces workspace scope and returns fused evidence', async () => {
    const result = await retrieveHybridContext(
      { workspaceId: 'ws', query: 'How do arrays provide index access?', intent: 'concept_explanation', limit: 2 },
      {
        denseRetriever: new LocalDenseRetriever(chunks, localProvider),
        sparseRetriever: new LocalSparseRetriever(chunks),
        reranker: new DeterministicHybridReranker(),
      },
    );

    expect(result.candidates[0]?.id).toBe('a');
    expect(result.candidates.every((candidate) => candidate.workspaceId === 'ws')).toBe(true);
    expect(result.diagnostics.strategy).toBe('hybrid_rrf');
  });

  it('marks empty retrieval as insufficient evidence', async () => {
    const result = await retrieveHybridContext(
      { workspaceId: 'missing', query: 'arrays', intent: 'factual_lookup' },
      {
        denseRetriever: new LocalDenseRetriever(chunks, localProvider),
        sparseRetriever: new LocalSparseRetriever(chunks),
      },
    );
    expect(result.insufficientEvidence).toBe(true);
    expect(result.candidates).toHaveLength(0);
  });
});
