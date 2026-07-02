import { RetrievedChunk, RetrievalConfidence } from './types';

export function calculateRetrievalConfidence(chunk: Partial<RetrievedChunk>): RetrievalConfidence {
  let score = 0;
  if (chunk.rrfScore !== undefined) {
    score = Math.min(chunk.rrfScore * 60, 1.0); // Normalize heuristic
  } else if (chunk.similarity !== undefined) {
    score = chunk.similarity;
  } else {
    score = 0.5; // Unknown sparse scale
  }

  return {
    score,
    level: score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low'
  };
}

export function filterLowConfidenceChunks(chunks: RetrievedChunk[], threshold = 0.5): RetrievedChunk[] {
  return chunks.filter(c => c.confidence >= threshold);
}

export function reciprocalRankFusion(dense: RetrievedChunk[], sparse: RetrievedChunk[], k = 60): RetrievedChunk[] {
  const scores = new Map<string, { rrf: number; chunk: RetrievedChunk }>();

  dense.forEach((c, index) => {
    scores.set(c.id, { rrf: 1 / (k + index + 1), chunk: c });
  });

  sparse.forEach((c, index) => {
    const existing = scores.get(c.id);
    const score = 1 / (k + index + 1);
    if (existing) {
      existing.rrf += score;
    } else {
      scores.set(c.id, { rrf: score, chunk: c });
    }
  });

  return Array.from(scores.values())
    .map(({ rrf, chunk }) => ({ ...chunk, rrfScore: rrf }))
    .sort((a, b) => (b.rrfScore || 0) - (a.rrfScore || 0));
}
