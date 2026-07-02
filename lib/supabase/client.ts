import { createBrowserClient } from '@supabase/ssr';
import { getClientEnv, hasSupabaseClientEnv } from '@/lib/config/env';

export function createClient() {
  if (!hasSupabaseClientEnv()) {
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder_key');
  }
  const env = getClientEnv();
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
