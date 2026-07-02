import { RetrievedChunk, RetrievalConfidence, RetrievalFusionConfig } from './types';

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

export function reciprocalRankFusion(
  dense: RetrievedChunk[], 
  sparse: RetrievedChunk[], 
  k = 60,
  config?: RetrievalFusionConfig
): RetrievedChunk[] {
  const scores = new Map<string, { rrf: number; chunk: RetrievedChunk }>();
  const sparseWeight = config?.sparseWeight ?? 1;
  const denseWeight = config?.denseWeight ?? 1;
  const rrfK = config?.rrfK ?? k;

  // Option: Fallback to sparse if dense scores are terribly weak
  if (config?.fallbackToSparseWhenDenseWeak) {
    const maxDense = dense.length > 0 ? (dense[0].similarity || 0) : 0;
    const threshold = config.minDenseConfidence ?? 0.3;
    if (maxDense < threshold) {
      // Just return sparse
      return sparse.map((c, i) => ({ ...c, rrfScore: 1 / (rrfK + i) }));
    }
  }

  dense.forEach((c, index) => {
    scores.set(c.id, { rrf: denseWeight * (1 / (rrfK + index + 1)), chunk: c });
  });

  sparse.forEach((c, index) => {
    const existing = scores.get(c.id);
    const score = sparseWeight * (1 / (rrfK + index + 1));
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
