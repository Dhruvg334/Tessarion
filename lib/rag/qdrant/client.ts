import type { HybridRetrievalQuery } from '../hybrid/types';
import type { SparseVector } from '../hybrid/sparse';
import {
  QDRANT_CHUNK_COLLECTION,
  QDRANT_DENSE_VECTOR,
  QDRANT_SPARSE_VECTOR,
  type QdrantChunkPoint,
  type QdrantConfig,
  type QdrantSearchPoint,
} from './types';

export class QdrantRequestError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'QdrantRequestError';
  }
}

export class QdrantRestClient {
  private readonly collectionName: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: QdrantConfig) {
    this.collectionName = config.collectionName ?? QDRANT_CHUNK_COLLECTION;
    this.timeoutMs = config.requestTimeoutMs ?? 15_000;
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.config.url.replace(/\/$/, '')}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          ...(this.config.apiKey ? { 'api-key': this.config.apiKey } : {}),
          ...init.headers,
        },
      });
      if (!response.ok) throw new QdrantRequestError('Qdrant request failed.', response.status);
      return await response.json() as T;
    } catch (error) {
      if (error instanceof QdrantRequestError) throw error;
      throw new QdrantRequestError(error instanceof Error && error.name === 'AbortError'
        ? 'Qdrant request timed out.' : 'Qdrant request failed.');
    } finally {
      clearTimeout(timeout);
    }
  }

  async ensureCollection(): Promise<void> {
    const path = `/collections/${encodeURIComponent(this.collectionName)}`;
    const check = await fetch(`${this.config.url.replace(/\/$/, '')}${path}`, {
      headers: this.config.apiKey ? { 'api-key': this.config.apiKey } : undefined,
    });
    if (check.ok) return;
    if (check.status !== 404) throw new QdrantRequestError('Unable to inspect Qdrant collection.', check.status);

    await this.request(path, {
      method: 'PUT',
      body: JSON.stringify({
        vectors: { [QDRANT_DENSE_VECTOR]: { size: this.config.denseVectorSize, distance: 'Cosine' } },
        sparse_vectors: { [QDRANT_SPARSE_VECTOR]: {} },
        on_disk_payload: true,
      }),
    });
  }

  async upsert(points: QdrantChunkPoint[]): Promise<void> {
    if (points.length === 0) return;
    await this.request(`/collections/${encodeURIComponent(this.collectionName)}/points?wait=true`, {
      method: 'PUT',
      body: JSON.stringify({ points }),
    });
  }

  async deleteByDocument(workspaceId: string, sourceDocumentId: string): Promise<void> {
    await this.request(`/collections/${encodeURIComponent(this.collectionName)}/points/delete?wait=true`, {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          must: [
            { key: 'workspaceId', match: { value: workspaceId } },
            { key: 'sourceDocumentId', match: { value: sourceDocumentId } },
          ],
        },
      }),
    });
  }

  async searchDense(query: HybridRetrievalQuery, vector: number[], limit: number): Promise<QdrantSearchPoint[]> {
    return this.queryPoints({ query: vector, using: QDRANT_DENSE_VECTOR, filter: createFilter(query), limit });
  }

  async searchSparse(query: HybridRetrievalQuery, vector: SparseVector, limit: number): Promise<QdrantSearchPoint[]> {
    return this.queryPoints({ query: vector, using: QDRANT_SPARSE_VECTOR, filter: createFilter(query), limit });
  }

  private async queryPoints(body: Record<string, unknown>): Promise<QdrantSearchPoint[]> {
    const response = await this.request<{ result?: { points?: QdrantSearchPoint[] } }>(
      `/collections/${encodeURIComponent(this.collectionName)}/points/query`,
      { method: 'POST', body: JSON.stringify({ ...body, with_payload: true }) },
    );
    return response.result?.points ?? [];
  }
}

function createFilter(query: HybridRetrievalQuery): Record<string, unknown> {
  const must: Record<string, unknown>[] = [{ key: 'workspaceId', match: { value: query.workspaceId } }];
  if (query.documentIds?.length) must.push({ key: 'sourceDocumentId', match: { any: query.documentIds } });
  return { must };
}
