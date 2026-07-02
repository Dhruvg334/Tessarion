/**
 * Tessarion — Supabase service role client
 * STRICTLY SERVER-SIDE ONLY. Bypasses RLS.
 * Never expose to client components.
 */
import { createClient } from '@supabase/supabase-js';
import { serverEnv, clientEnv } from '@/lib/config/env';

export function createServiceClient() {
  if (!serverEnv.supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for service client');
  }

  return createClient(clientEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
