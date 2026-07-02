/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { RetrievedChunk } from '@/lib/rag/types';

export interface EmbeddingProvider {
  id: string;
  displayName: string;
  isConfigured: () => boolean;
  embedDocument: (text: string) => Promise<number[]>;
  embedQuery: (text: string) => Promise<number[]>;
  embedDocuments: (texts: string[]) => Promise<number[][]>;
}

export interface RerankProvider {
  id: string;
  displayName: string;
  isConfigured: () => boolean;
  rerank: (query: string, candidates: RetrievedChunk[], options?: any) => Promise<{ candidates: { chunk: RetrievedChunk; score: number }[] }>;
}

export interface JudgeProvider {
  id: string;
  displayName: string;
  isConfigured: () => boolean;
  evaluateFaithfulness: (input: any) => Promise<any>;
  evaluateAnswerRelevance: (input: any) => Promise<any>;
}
