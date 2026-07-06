 
import { AppError } from '@/lib/errors/app-error';
import { EmbeddingProvider, RerankProvider } from './types';
import { geminiProvider } from './gemini';
import { localProvider } from './local';
import { jinaProvider } from './jina';
import { cohereProvider } from './cohere';
import { openSourceProvider } from './open-source';
import { assertNoExternalProviderInCI } from '@/lib/config/ci-guards';

export const embeddingProviders: Record<string, EmbeddingProvider> = {
  gemini: geminiProvider,
  local: localProvider
};

export const rerankProviders: Record<string, RerankProvider> = {
  gemini: geminiProvider as unknown as RerankProvider, // Gemini doesn't have a direct rerank endpoint natively yet, we can build a stub
  local: localProvider as unknown as RerankProvider,
  jina: jinaProvider,
  cohere: cohereProvider,
  open_source: openSourceProvider
};

export function getEmbeddingProvider(id?: string): EmbeddingProvider {
  let resolvedId = id;
  if (!resolvedId) {
    resolvedId = process.env.CI === 'true' ? 'local' : 'gemini';
  }
  
  assertNoExternalProviderInCI(resolvedId);
  const provider = embeddingProviders[resolvedId];
  if (!provider) throw new AppError(`Unknown embedding provider: ${resolvedId}`, 400);
  if (!provider.isConfigured()) throw new AppError(`Provider ${resolvedId} is not configured`, 500);
  return provider;
}

export function getRerankProvider(id?: string): RerankProvider {
  let resolvedId = id;
  if (!resolvedId) {
    resolvedId = 'local'; // default reranker is local anyway
  }
  
  assertNoExternalProviderInCI(resolvedId);
  const provider = rerankProviders[resolvedId];
  if (!provider) throw new AppError(`Unknown rerank provider: ${resolvedId}`, 400);
  if (!provider.isConfigured()) throw new AppError(`Provider ${resolvedId} is not configured`, 500);
  return provider;
}
