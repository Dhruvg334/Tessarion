import { RerankProvider } from './types';

export const cohereProvider: RerankProvider = {
  id: 'cohere',
  displayName: 'Cohere',
  isConfigured: () => !!process.env.COHERE_API_KEY,
  rerank: async () => { throw new Error('Not implemented'); }
};
