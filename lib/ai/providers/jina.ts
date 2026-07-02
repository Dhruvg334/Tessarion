import { RerankProvider } from './types';

export const jinaProvider: RerankProvider = {
  id: 'jina',
  displayName: 'Jina AI',
  isConfigured: () => !!process.env.JINA_API_KEY,
  rerank: async () => { throw new Error('Not implemented'); }
};
