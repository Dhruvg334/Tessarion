import { NextResponse } from 'next/server';
import { z } from 'zod';

import { hasSupabaseClientEnv } from '@/lib/config/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const SignupSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(256),
});

export async function POST(request: Request) {
  if (!hasSupabaseClientEnv()) {
    return NextResponse.json({ error: 'Authentication is not configured in this environment.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'The request body is not valid JSON.' }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Use a valid email address and a password of at least eight characters.' }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp(parsed.data);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, confirmationRequired: Boolean(data.user && !data.session) });
  } catch {
    return NextResponse.json(
      { error: 'Tessarion could not connect to the authentication service. Check the Supabase service and environment configuration.' },
      { status: 503 },
    );
  }
}
