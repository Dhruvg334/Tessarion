/**
 * Tessarion — Supabase browser client
 * Uses ONLY public environment variables.
 */
import { createBrowserClient } from '@supabase/ssr';
import { clientEnv } from '@/lib/config/env';

export function createClient() {
  return createBrowserClient(
    clientEnv.supabaseUrl,
    clientEnv.supabaseAnonKey
  );
}
