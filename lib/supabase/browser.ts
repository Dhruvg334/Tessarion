// Browser Supabase Client - Uses public env vars
import { createBrowserClient } from '@supabase/ssr';
import { clientEnv } from '../config/env';

export function createClient() {
  return createBrowserClient(
    clientEnv.supabaseUrl!,
    clientEnv.supabaseAnonKey!
  );
}
