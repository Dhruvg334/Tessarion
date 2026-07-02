import { RetrievedChunk, RerankResult } from '@/lib/rag/types';

import { getRerankProvider } from '@/lib/ai/providers/registry';

export async function rerankChunks(query: string, candidates: RetrievedChunk[], options?: { provider?: string }): Promise<RerankResult> {
  const providerId = options?.provider || (process.env.NODE_ENV === 'test' ? 'local' : 'local');
  const provider = getRerankProvider(providerId);
  return provider.rerank(query, candidates, options);
}
