import { SourceChunk } from '@/types/database';
import { ExtractedConcept } from '../types';
import { extractConceptsLocal } from './local-concept-extraction';

export interface ConceptExtractionOptions {
  provider?: 'local' | 'gemini';
  minConfidence?: number;
}

export async function extractConcepts(
  chunks: SourceChunk[],
  options?: ConceptExtractionOptions
): Promise<ExtractedConcept[]> {
  const provider = options?.provider || 'local';
  
  if (provider === 'local') {
    return extractConceptsLocal(chunks);
  }

  // TODO: Real LLM extraction with Vercel AI SDK when Gemini is configured
  // For now, if Gemini fails or isn't fully set up, we could fallback to local
  // But since we aren't calling paid APIs yet in CI, we just use local.
  return extractConceptsLocal(chunks);
}
