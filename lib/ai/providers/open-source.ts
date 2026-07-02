import { RerankProvider } from './types';

export const openSourceProvider: RerankProvider = {
  id: 'open_source',
  displayName: 'Open Source / HuggingFace',
  isConfigured: () => !!process.env.HUGGINGFACE_API_KEY,
  rerank: async () => { throw new Error('Not implemented'); }
};
