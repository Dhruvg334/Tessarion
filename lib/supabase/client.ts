import { createBrowserClient } from '@supabase/ssr';
import { getClientEnv, hasSupabaseClientEnv } from '@/lib/config/env';

export function createClient() {
  if (!hasSupabaseClientEnv()) {
    throw new Error('Supabase client environment variables are missing');
  }
  const env = getClientEnv();
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
