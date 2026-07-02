import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getClientEnv, hasSupabaseClientEnv } from '@/lib/config/env';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const env = getClientEnv();

  if (!hasSupabaseClientEnv()) {
    return createServerClient('https://placeholder.supabase.co', 'placeholder_key', {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    });
  }

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}
