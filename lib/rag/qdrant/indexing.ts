import { createHash } from 'node:crypto';
import type { RetrievedChunk } from '../types';
import { createSparseVector } from '../hybrid/sparse';
import type { QdrantChunkPoint } from './types';

export interface DocumentEmbeddingProvider {
  embedDocuments(texts: string[]): Promise<number[][]>;
}

function stablePointId(workspaceId: string, chunkId: string, embeddingVersion: string): string {
  const digest = createHash('sha256').update(`${workspaceId}:${chunkId}:${embeddingVersion}`).digest('hex');
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-5${digest.slice(13, 16)}-a${digest.slice(17, 20)}-${digest.slice(20, 32)}`;
}

export async function buildQdrantChunkPoints(
  chunks: RetrievedChunk[],
  embeddings: DocumentEmbeddingProvider,
  embeddingVersion: string,
  indexedAt = new Date().toISOString(),
): Promise<QdrantChunkPoint[]> {
  if (chunks.length === 0) return [];
  const denseVectors = await embeddings.embedDocuments(chunks.map((chunk) => chunk.content));
  if (denseVectors.length !== chunks.length) throw new Error('Embedding batch size did not match chunk count.');

  return chunks.map((chunk, index) => ({
    id: stablePointId(chunk.workspaceId, chunk.id, embeddingVersion),
    vector: {
      dense: denseVectors[index],
      sparse: createSparseVector(chunk.content),
    },
    payload: {
      workspaceId: chunk.workspaceId,
      sourceDocumentId: chunk.sourceDocumentId,
      sourceChunkId: chunk.id,
      chunkIndex: chunk.chunkIndex,
      tokenCount: chunk.tokenCount,
      content: chunk.content,
      sectionHint: chunk.sectionHint,
      contentHash: createHash('sha256').update(chunk.content).digest('hex'),
      embeddingVersion,
      indexedAt,
    },
  }));
}
