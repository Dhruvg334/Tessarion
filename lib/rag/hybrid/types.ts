import type { RetrievedChunk } from '../types';

export type RetrievalIntent =
  | 'factual_lookup'
  | 'concept_explanation'
  | 'comparison'
  | 'prerequisite_lookup'
  | 'misconception_diagnosis'
  | 'review_recommendation'
  | 'tutoring_recovery';

export interface HybridRetrievalQuery {
  workspaceId: string;
  query: string;
  intent: RetrievalIntent;
  documentIds?: string[];
  conceptIds?: string[];
  limit?: number;
}

export interface DenseSearchHit {
  chunk: RetrievedChunk;
  score: number;
  rank: number;
}

export interface SparseSearchHit {
  chunk: RetrievedChunk;
  score: number;
  rank: number;
}

export interface HybridCandidate extends RetrievedChunk {
  denseScore?: number;
  sparseScore?: number;
  denseRank?: number;
  sparseRank?: number;
  fusionScore: number;
  rerankScore?: number;
  matchedTerms?: string[];
}

export interface HybridRetrievalResult {
  query: HybridRetrievalQuery;
  candidates: HybridCandidate[];
  insufficientEvidence: boolean;
  diagnostics: {
    denseCandidates: number;
    sparseCandidates: number;
    fusedCandidates: number;
    returnedCandidates: number;
    strategy: 'dense' | 'sparse' | 'hybrid_rrf';
    reranked: boolean;
  };
}

export interface HybridRetrievalConfig {
  denseCandidateLimit: number;
  sparseCandidateLimit: number;
  finalLimit: number;
  rrfK: number;
  denseWeight: number;
  sparseWeight: number;
  minimumEvidenceScore: number;
  rerank: boolean;
}

export interface DenseRetriever {
  search(query: HybridRetrievalQuery, limit: number): Promise<DenseSearchHit[]>;
}

export interface SparseRetriever {
  search(query: HybridRetrievalQuery, limit: number): Promise<SparseSearchHit[]>;
}

export interface CandidateReranker {
  rerank(query: string, candidates: HybridCandidate[]): Promise<HybridCandidate[]>;
}
