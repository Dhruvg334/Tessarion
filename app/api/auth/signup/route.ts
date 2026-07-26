import { NextResponse } from 'next/server';
import { z } from 'zod';

import { hasSupabaseClientEnv } from '@/lib/config/env';
import { normalizeSignupError } from '@/lib/errors/auth-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const SignupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(256),
});

export async function POST(request: Request) {
  if (!hasSupabaseClientEnv()) {
    return NextResponse.json({ error: 'Authentication is not configured in this environment.', kind: 'service_unavailable' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'The request body is not valid JSON.', kind: 'unknown' }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a complete email address and a password of at least eight characters.', kind: 'invalid_email' }, { status: 422 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp(parsed.data);

    if (error) {
      const normalized = normalizeSignupError(error.message, error.status);
      const response = NextResponse.json(
        { error: normalized.message, kind: normalized.kind, retryAfterSeconds: normalized.retryAfterSeconds },
        { status: normalized.status },
      );
      if (normalized.retryAfterSeconds) response.headers.set('retry-after', String(normalized.retryAfterSeconds));
      return response;
    }

    return NextResponse.json({ ok: true, confirmationRequired: Boolean(data.user && !data.session) });
  } catch {
    return NextResponse.json({ error: 'The authentication service is temporarily unavailable.', kind: 'service_unavailable' }, { status: 503 });
  }
}
