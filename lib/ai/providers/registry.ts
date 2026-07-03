 
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

export function getEmbeddingProvider(id: string = 'gemini'): EmbeddingProvider {
  if (process.env.CI === 'true') id = 'local';
  assertNoExternalProviderInCI(id);
  const provider = embeddingProviders[id];
  if (!provider) throw new AppError(`Unknown embedding provider: ${id}`, 400);
  if (!provider.isConfigured()) throw new AppError(`Provider ${id} is not configured`, 500);
  return provider;
}

export function getRerankProvider(id: string = 'local'): RerankProvider {
  if (process.env.CI === 'true') id = 'local';
  assertNoExternalProviderInCI(id);
  const provider = rerankProviders[id];
  if (!provider) throw new AppError(`Unknown rerank provider: ${id}`, 400);
  if (!provider.isConfigured()) throw new AppError(`Provider ${id} is not configured`, 500);
  return provider;
}
