import type { RetrievedChunk } from '../types';
import { lexicalScore } from './sparse';
import type { DenseRetriever, DenseSearchHit, HybridRetrievalQuery, SparseRetriever, SparseSearchHit } from './types';

export interface EmbeddingFunctions {
  embedQuery(text: string): Promise<number[]>;
  embedDocument(text: string): Promise<number[]>;
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length !== right.length) return 0;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude) || 1);
}

function filterChunks(chunks: RetrievedChunk[], query: HybridRetrievalQuery): RetrievedChunk[] {
  return chunks.filter((chunk) => {
    if (chunk.workspaceId !== query.workspaceId) return false;
    if (query.documentIds?.length && !query.documentIds.includes(chunk.sourceDocumentId)) return false;
    return true;
  });
}

export class LocalDenseRetriever implements DenseRetriever {
  constructor(private readonly chunks: RetrievedChunk[], private readonly embeddings: EmbeddingFunctions) {}

  async search(query: HybridRetrievalQuery, limit: number): Promise<DenseSearchHit[]> {
    const queryVector = await this.embeddings.embedQuery(query.query);
    const hits = await Promise.all(filterChunks(this.chunks, query).map(async (chunk) => ({
      chunk,
      score: cosineSimilarity(queryVector, await this.embeddings.embedDocument(chunk.content)),
    })));

    return hits
      .sort((left, right) => right.score - left.score)
      .slice(0, limit)
      .map((hit, index) => ({ ...hit, rank: index + 1 }));
  }
}

export class LocalSparseRetriever implements SparseRetriever {
  constructor(private readonly chunks: RetrievedChunk[]) {}

  async search(query: HybridRetrievalQuery, limit: number): Promise<SparseSearchHit[]> {
    return filterChunks(this.chunks, query)
      .map((chunk) => ({ chunk, score: lexicalScore(query.query, chunk.content).score }))
      .filter((hit) => hit.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit)
      .map((hit, index) => ({ ...hit, rank: index + 1 }));
  }
}
