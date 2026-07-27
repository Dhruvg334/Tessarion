import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getServerEnv, hasSupabaseClientEnv } from '@/lib/config/env';
import { isUnsupportedTestEmail, normalizeSignupError } from '@/lib/errors/auth-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const SignupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(256),
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

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a complete email address and a password of at least eight characters.', kind: 'invalid_email', requestId }, { status: 422 });
  }

  if (isUnsupportedTestEmail(parsed.data.email)) {
    return NextResponse.json(
      {
        error: 'Use a real email inbox. Example and test domains such as test.com are not accepted by the authentication service.',
        kind: 'invalid_email',
        requestId,
      },
      { status: 422 },
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { appUrl } = getServerEnv();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${appUrl.replace(/\/$/, '')}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      console.warn('[auth.signup]', { requestId, code: error.code, status: error.status, name: error.name });
      const normalized = normalizeSignupError({ code: error.code, message: error.message, status: error.status });
      const response = NextResponse.json(
        { error: normalized.message, kind: normalized.kind, retryAfterSeconds: normalized.retryAfterSeconds, requestId },
        { status: normalized.status },
      );
      if (normalized.retryAfterSeconds) response.headers.set('retry-after', String(normalized.retryAfterSeconds));
      return response;
    }

    if (!data.user) {
      console.warn('[auth.signup]', { requestId, code: 'missing_user', status: 502 });
      return NextResponse.json({ error: 'The authentication service did not return a user record.', kind: 'service_unavailable', requestId }, { status: 502 });
    }

    return NextResponse.json({ ok: true, confirmationRequired: !data.session, requestId });
  } catch (error: unknown) {
    console.error('[auth.signup.unexpected]', { requestId, name: error instanceof Error ? error.name : 'UnknownError' });
    return NextResponse.json({ error: 'The authentication service is temporarily unavailable.', kind: 'service_unavailable', requestId }, { status: 503 });
  }
}
