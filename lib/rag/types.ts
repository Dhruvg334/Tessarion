export type RetrievalMode = 'dense' | 'sparse' | 'hybrid';

export interface RetrievalFusionConfig {
  sparseWeight?: number;
  denseWeight?: number;
  rrfK?: number;
  minDenseConfidence?: number;
  fallbackToSparseWhenDenseWeak?: boolean;
}

export interface RetrievedChunk {
  id: string;
  sourceDocumentId: string;
  workspaceId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  sectionHint?: string;
  similarity?: number;
  sparseRank?: number;
  denseRank?: number;
  rrfScore?: number;
  confidence: number;
}

export interface RetrievalConfidence {
  score: number;
  level: 'high' | 'medium' | 'low';
}

export interface CitationReference {
  id: string;
  chunkId: string;
  documentId: string;
  index: number;
}

export interface RagContext {
  text: string;
  citations: CitationReference[];
  totalTokens: number;
}

export interface RerankCandidate {
  chunk: RetrievedChunk;
  score: number;
}

export interface RerankResult {
  candidates: RerankCandidate[];
}

export interface RagEvaluationCase {
  query: string;
  expectedChunkIds: string[];
}

export interface RagEvaluationResult {
  recallAt3: number;
  recallAt5: number;
  mrrAt5: number;
  ndcgAt5: number;
  contextPrecisionAt5: number;
}
