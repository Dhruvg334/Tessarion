/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getServerEnv, assertGeminiEnv } from '@/lib/config/env';
import { AppError } from '@/lib/errors/app-error';

export const GEMINI_FAST_MODEL = 'gemini-1.5-flash';
export const GEMINI_REASONING_MODEL = 'gemini-1.5-pro';
export const GEMINI_EMBEDDING_MODEL = 'text-embedding-004';

export function getGeminiProvider() {
  try {
    assertGeminiEnv();
  } catch (err) {
    throw new AppError('Gemini API key is not configured', 500, 'AI_CONFIG_ERROR');
  }
  const env = getServerEnv();
  return createGoogleGenerativeAI({ apiKey: env.geminiKey });
}
