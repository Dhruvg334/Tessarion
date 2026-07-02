import { AppError } from '@/lib/errors/app-error';
import { RetrievedChunk, RerankResult } from '@/lib/rag/types';

// TODO: Reranking will be benchmarked against non-reranked hybrid retrieval.
export async function rerankChunks(_query: string, candidates: RetrievedChunk[]): Promise<RerankResult> {
  // If we had the live scaffold, we would call Gemini here with structured output.
  // For now, if no key, or we just want to safely return the fallback:
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new AppError('Gemini API key is missing', 500, 'AI_CONFIG_ERROR');
  }
  
  // Safe scaffold fallback (identity reranking for now to keep tests passing)
  return {
    candidates: candidates.map(c => ({ chunk: c, score: c.confidence || 0.5 }))
  };
}
