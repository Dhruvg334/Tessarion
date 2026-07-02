import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getClientEnv, hasSupabaseClientEnv } from '@/lib/config/env';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const env = getClientEnv();

  if (!hasSupabaseClientEnv()) {
    console.warn('Missing Supabase server env.');
  }

  return createServerClient(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseAnonKey || 'placeholder_key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Ignored during static generation
          }
        },
      },
    }
  );
}
