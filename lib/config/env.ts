/**
 * Tessarion - Environment Validation
 */
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

export function getClientEnv() {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!result.success) {
    if (typeof window !== 'undefined') {
      console.warn('Missing Supabase client env variables');
      return { supabaseUrl: '', supabaseAnonKey: '' };
    }
    // We allow empty in build to prevent crash, but throw if requested during runtime flow
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

// Fallbacks for safe UI rendering
export const clientEnv = getClientEnv();
export const serverEnv = (typeof window === 'undefined' ? getServerEnv() : {}) as ReturnType<typeof getServerEnv>;
