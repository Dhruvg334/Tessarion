import type { RetrievedChunk } from '../types';
import type { SparseVector } from '../hybrid/sparse';

export const QDRANT_CHUNK_COLLECTION = 'tessarion_workspace_chunks_v1';
export const QDRANT_DENSE_VECTOR = 'dense';
export const QDRANT_SPARSE_VECTOR = 'sparse';

export interface QdrantConfig {
  url: string;
  apiKey?: string;
  collectionName?: string;
  denseVectorSize: number;
  requestTimeoutMs?: number;
}

export interface QdrantChunkPayload {
  workspaceId: string;
  sourceDocumentId: string;
  sourceChunkId: string;
  chunkIndex: number;
  tokenCount: number;
  content: string;
  sectionHint?: string;
  contentHash: string;
  embeddingVersion: string;
  indexedAt: string;
}

export interface QdrantChunkPoint {
  id: string;
  vector: {
    dense: number[];
    sparse: SparseVector;
  };
  payload: QdrantChunkPayload;
}

export interface QdrantSearchPoint {
  id: string | number;
  score: number;
  payload?: Partial<QdrantChunkPayload>;
}

export function payloadToRetrievedChunk(payload: Partial<QdrantChunkPayload>, score: number): RetrievedChunk | null {
  if (!payload.sourceChunkId || !payload.sourceDocumentId || !payload.workspaceId || payload.content === undefined
      || payload.chunkIndex === undefined || payload.tokenCount === undefined) return null;

  return {
    id: payload.sourceChunkId,
    sourceDocumentId: payload.sourceDocumentId,
    workspaceId: payload.workspaceId,
    content: payload.content,
    chunkIndex: payload.chunkIndex,
    tokenCount: payload.tokenCount,
    sectionHint: payload.sectionHint,
    similarity: score,
    confidence: Math.max(0, Math.min(score, 1)),
  };
}
