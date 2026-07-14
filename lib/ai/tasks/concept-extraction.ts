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

  return extractConceptsLocal(chunks);
}
