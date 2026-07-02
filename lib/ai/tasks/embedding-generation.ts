import { getGeminiProvider, GEMINI_EMBEDDING_MODEL } from '@/lib/ai/gemini';
import { embedMany, embed } from 'ai';
import { AppError } from '@/lib/errors/app-error';

function validateInput(text: string) {
  if (!text || !text.trim()) {
    throw new AppError('Cannot embed empty or whitespace string', 400, 'VALIDATION_ERROR');
  }
  if (text.length > 50000) {
    throw new AppError('Input too large for embedding', 400, 'VALIDATION_ERROR');
  }
}

export async function generateDocumentEmbedding(text: string): Promise<number[]> {
  validateInput(text);
  const google = getGeminiProvider();
  const { embedding } = await embed({ model: google.textEmbeddingModel(GEMINI_EMBEDDING_MODEL), value: text });
  return embedding;
}

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  validateInput(text);
  const google = getGeminiProvider();
  // We can prefix for retrieval task type if required by Google model, ai-sdk handles it typically or we pass prefix.
  const { embedding } = await embed({ model: google.textEmbeddingModel(GEMINI_EMBEDDING_MODEL), value: text });
  return embedding;
}

export async function generateDocumentEmbeddings(texts: string[]): Promise<number[][]> {
  texts.forEach(validateInput);
  const google = getGeminiProvider();
  const { embeddings } = await embedMany({ model: google.textEmbeddingModel(GEMINI_EMBEDDING_MODEL), values: texts });
  return embeddings;
}
