import { fuseWithReciprocalRank } from './fusion';
import type {
  CandidateReranker,
  DenseRetriever,
  HybridRetrievalConfig,
  HybridRetrievalQuery,
  HybridRetrievalResult,
  SparseRetriever,
} from './types';

export const DEFAULT_HYBRID_RETRIEVAL_CONFIG: HybridRetrievalConfig = {
  denseCandidateLimit: 30,
  sparseCandidateLimit: 30,
  finalLimit: 8,
  rrfK: 60,
  denseWeight: 1,
  sparseWeight: 1,
  minimumEvidenceScore: 0.012,
  rerank: true,
};

export interface HybridRetrievalDependencies {
  denseRetriever: DenseRetriever;
  sparseRetriever: SparseRetriever;
  reranker?: CandidateReranker;
}

export async function retrieveHybridContext(
  query: HybridRetrievalQuery,
  dependencies: HybridRetrievalDependencies,
  partialConfig: Partial<HybridRetrievalConfig> = {},
): Promise<HybridRetrievalResult> {
  const config = { ...DEFAULT_HYBRID_RETRIEVAL_CONFIG, ...partialConfig };
  const finalLimit = Math.min(query.limit ?? config.finalLimit, config.finalLimit);

  const [denseHits, sparseHits] = await Promise.all([
    dependencies.denseRetriever.search(query, config.denseCandidateLimit),
    dependencies.sparseRetriever.search(query, config.sparseCandidateLimit),
  ]);

  const fused = fuseWithReciprocalRank(denseHits, sparseHits, config);
  const ranked = config.rerank && dependencies.reranker
    ? await dependencies.reranker.rerank(query.query, fused)
    : fused;
  const candidates = ranked.slice(0, finalLimit);
  const strongestScore = candidates[0]?.rerankScore ?? candidates[0]?.fusionScore ?? 0;

  return {
    query,
    candidates,
    insufficientEvidence: candidates.length === 0 || strongestScore < config.minimumEvidenceScore,
    diagnostics: {
      denseCandidates: denseHits.length,
      sparseCandidates: sparseHits.length,
      fusedCandidates: fused.length,
      returnedCandidates: candidates.length,
      strategy: denseHits.length > 0 && sparseHits.length > 0
        ? 'hybrid_rrf'
        : denseHits.length > 0 ? 'dense' : 'sparse',
      reranked: Boolean(config.rerank && dependencies.reranker),
    },
  };
}
