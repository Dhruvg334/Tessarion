import { getEmbeddingProvider } from '@/lib/ai/providers/registry';
import { AppError } from '@/lib/errors/app-error';

function validateInput(text: string) {
  if (!text || !text.trim()) {
    throw new AppError('Cannot embed empty or whitespace string', 400, 'VALIDATION_ERROR');
  }
  if (text.length > 50000) {
    throw new AppError('Input too large for embedding', 400, 'VALIDATION_ERROR');
  }
}

function resolveProvider(options?: { provider?: string }) {
  if (process.env.NODE_ENV === 'test' && !options?.provider) return 'local';
  return options?.provider || 'gemini';
}

export async function generateDocumentEmbedding(text: string, options?: { provider?: string }): Promise<number[]> {
  validateInput(text);
  return getEmbeddingProvider(resolveProvider(options)).embedDocument(text);
}

export async function generateQueryEmbedding(text: string, options?: { provider?: string }): Promise<number[]> {
  validateInput(text);
  return getEmbeddingProvider(resolveProvider(options)).embedQuery(text);
}

export async function generateDocumentEmbeddings(texts: string[], options?: { provider?: string }): Promise<number[][]> {
  texts.forEach(validateInput);
  return getEmbeddingProvider(resolveProvider(options)).embedDocuments(texts);
}
