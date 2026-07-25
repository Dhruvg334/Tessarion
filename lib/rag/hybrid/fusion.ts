import type { DenseSearchHit, HybridCandidate, SparseSearchHit } from './types';

interface FusionOptions {
  rrfK: number;
  denseWeight: number;
  sparseWeight: number;
}

export function fuseWithReciprocalRank(
  denseHits: DenseSearchHit[],
  sparseHits: SparseSearchHit[],
  options: FusionOptions,
): HybridCandidate[] {
  const candidates = new Map<string, HybridCandidate>();

  for (const hit of denseHits) {
    const contribution = options.denseWeight / (options.rrfK + hit.rank);
    candidates.set(hit.chunk.id, {
      ...hit.chunk,
      denseScore: hit.score,
      denseRank: hit.rank,
      fusionScore: contribution,
    });
  }

  for (const hit of sparseHits) {
    const contribution = options.sparseWeight / (options.rrfK + hit.rank);
    const existing = candidates.get(hit.chunk.id);
    candidates.set(hit.chunk.id, {
      ...(existing ?? hit.chunk),
      sparseScore: hit.score,
      sparseRank: hit.rank,
      fusionScore: (existing?.fusionScore ?? 0) + contribution,
    });
  }

  return [...candidates.values()].sort((left, right) => {
    if (right.fusionScore !== left.fusionScore) return right.fusionScore - left.fusionScore;
    const rightBestRank = Math.min(right.denseRank ?? Number.MAX_SAFE_INTEGER, right.sparseRank ?? Number.MAX_SAFE_INTEGER);
    const leftBestRank = Math.min(left.denseRank ?? Number.MAX_SAFE_INTEGER, left.sparseRank ?? Number.MAX_SAFE_INTEGER);
    return leftBestRank - rightBestRank;
  });
}
