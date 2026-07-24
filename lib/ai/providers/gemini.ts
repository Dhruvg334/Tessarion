/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getServerEnv } from '@/lib/config/env';
import { EmbeddingProvider } from './types';

export const GEMINI_FAST_MODEL = 'gemini-2.5-flash';
export const GEMINI_REASONING_MODEL = 'gemini-1.5-pro'; // Or gemini-2.5-pro when available
export const GEMINI_EMBEDDING_MODEL = 'text-embedding-004'; // Keep as fallback/standard since 001 may not be in ai-sdk fully

import { AppError } from '@/lib/errors/app-error';

let googleProvider: any = null;
function getGoogleProvider() {
  if (!googleProvider) {
    const env = getServerEnv();
    if (!env.geminiKey) throw new AppError('AI provider is not configured', 500, 'PROVIDER_NOT_CONFIGURED');
    googleProvider = createGoogleGenerativeAI({ apiKey: env.geminiKey });
  }
  return googleProvider;
}

export const geminiProvider: EmbeddingProvider = {
  id: 'gemini',
  displayName: 'Google Gemini',
  isConfigured: () => !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  embedDocument: async (text) => {
    const { embed } = await import('ai');
    const { embedding } = await embed({ model: getGoogleProvider().textEmbeddingModel(GEMINI_EMBEDDING_MODEL), value: text });
    return embedding;
  },
  embedQuery: async (text) => {
    const { embed } = await import('ai');
    const { embedding } = await embed({ model: getGoogleProvider().textEmbeddingModel(GEMINI_EMBEDDING_MODEL), value: text });
    return embedding;
  },
  embedDocuments: async (texts) => {
    const { embedMany } = await import('ai');
    const { embeddings } = await embedMany({ model: getGoogleProvider().textEmbeddingModel(GEMINI_EMBEDDING_MODEL), values: texts });
    return embeddings;
  }
};
