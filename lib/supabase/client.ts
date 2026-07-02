import { createBrowserClient } from '@supabase/ssr';
import { getClientEnv, hasSupabaseClientEnv } from '@/lib/config/env';

export function createClient() {
  if (!hasSupabaseClientEnv()) {
    console.warn('Supabase env missing. Client will fail on actual requests.');
  }
  const env = getClientEnv();
  return createBrowserClient(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseAnonKey || 'placeholder_key'
  );
}
