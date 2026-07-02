import { google } from '../gemini';
export const embeddingModel = google.textEmbeddingModel('text-embedding-004');
// TODO: Implement embedding generation
export async function generateEmbeddings(_texts: string[]) { void _texts; return []; }
