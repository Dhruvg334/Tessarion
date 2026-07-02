 
 
export { GEMINI_FAST_MODEL, GEMINI_REASONING_MODEL, GEMINI_EMBEDDING_MODEL } from './providers/gemini';
import { getEmbeddingProvider } from './providers/registry';

export function getGeminiProvider() {
  return getEmbeddingProvider('gemini');
}
