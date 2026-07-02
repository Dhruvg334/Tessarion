import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
});

export const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  TESSARION_APP_URL: z.string().url().default('http://localhost:3000'),
});

export function hasSupabaseClientEnv(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function assertSupabaseClientEnv() {
  if (!hasSupabaseClientEnv()) {
    throw new Error('Supabase client environment variables are missing');
  }
}

export function assertGeminiEnv() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is missing');
  }
}

export function getClientEnv() {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!result.success) {
    return { supabaseUrl: '', supabaseAnonKey: '' };
  }
  return {
    supabaseUrl: result.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function getServerEnv() {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error('Invalid server environment: ' + JSON.stringify(result.error.format()));
  }
  return {
    supabaseServiceRoleKey: result.data.SUPABASE_SERVICE_ROLE_KEY,
    geminiKey: result.data.GOOGLE_GENERATIVE_AI_API_KEY,
    appUrl: result.data.TESSARION_APP_URL,
  };
}

export const clientEnv = getClientEnv();
export const serverEnv = (typeof window === 'undefined' ? getServerEnv() : {}) as ReturnType<typeof getServerEnv>;
