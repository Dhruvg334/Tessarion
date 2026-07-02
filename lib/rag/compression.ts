import { RetrievedChunk } from './types';

export function compressContextByQueryTerms(chunks: RetrievedChunk[], queryTerms: string[], maxTokens: number): RetrievedChunk[] {
  // deterministic compression:
  // 1. remove duplicates
  const seen = new Set<string>();
  const unique = chunks.filter(c => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  // 2. enforce max tokens strictly
  let total = 0;
  const result: RetrievedChunk[] = [];
  for (const c of unique) {
    if (total + c.tokenCount <= maxTokens) {
      result.push(c);
      total += c.tokenCount;
    }
  }
  return result;
}
