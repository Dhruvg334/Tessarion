import { createSparseVector } from '../hybrid/sparse';
import type { DenseRetriever, DenseSearchHit, HybridRetrievalQuery, SparseRetriever, SparseSearchHit } from '../hybrid/types';
import { payloadToRetrievedChunk } from './types';
import { QdrantRestClient } from './client';

export interface QueryEmbeddingProvider {
  embedQuery(text: string): Promise<number[]>;
}

export class QdrantDenseRetriever implements DenseRetriever {
  constructor(private readonly client: QdrantRestClient, private readonly embeddings: QueryEmbeddingProvider) {}

  async search(query: HybridRetrievalQuery, limit: number): Promise<DenseSearchHit[]> {
    const points = await this.client.searchDense(query, await this.embeddings.embedQuery(query.query), limit);
    return points.flatMap((point, index) => {
      const chunk = payloadToRetrievedChunk(point.payload ?? {}, point.score);
      return chunk ? [{ chunk, score: point.score, rank: index + 1 }] : [];
    });
  }
}

export class QdrantSparseRetriever implements SparseRetriever {
  constructor(private readonly client: QdrantRestClient) {}

  async search(query: HybridRetrievalQuery, limit: number): Promise<SparseSearchHit[]> {
    const points = await this.client.searchSparse(query, createSparseVector(query.query), limit);
    return points.flatMap((point, index) => {
      const chunk = payloadToRetrievedChunk(point.payload ?? {}, point.score);
      return chunk ? [{ chunk, score: point.score, rank: index + 1 }] : [];
    });
  }
}
