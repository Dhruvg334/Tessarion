import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { hasSupabaseClientEnv } from '@/lib/config/env';
import { normalizeLoginError } from '@/lib/errors/auth-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  const requestId = randomUUID();

  if (!hasSupabaseClientEnv()) {
    return NextResponse.json({ error: 'Authentication is not configured in this environment.', kind: 'service_unavailable', requestId }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'The request body is not valid JSON.', kind: 'unknown', requestId }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address and password.', kind: 'invalid_credentials', requestId }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      console.warn('[auth.login]', { requestId, code: error.code, status: error.status, name: error.name });
      const normalized = normalizeLoginError({ code: error.code, message: error.message, status: error.status });
      const response = NextResponse.json(
        { error: normalized.message, kind: normalized.kind, retryAfterSeconds: normalized.retryAfterSeconds, requestId },
        { status: normalized.status },
      );
      if (normalized.retryAfterSeconds) response.headers.set('retry-after', String(normalized.retryAfterSeconds));
      return response;
    }

    if (!data.session || !data.user) {
      return NextResponse.json({ error: 'No authenticated session was created.', kind: 'service_unavailable', requestId }, { status: 502 });
    }

    return NextResponse.json({ ok: true, requestId });
  } catch (error: unknown) {
    console.error('[auth.login.unexpected]', { requestId, name: error instanceof Error ? error.name : 'UnknownError' });
    return NextResponse.json({ error: 'Tessarion could not connect to the authentication service.', kind: 'service_unavailable', requestId }, { status: 503 });
  }
}
