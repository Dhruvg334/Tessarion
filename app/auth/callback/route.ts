import { NextResponse, type NextRequest } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

function safeNextPath(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeNextPath(request.nextUrl.searchParams.get('next'));
  const origin = request.nextUrl.origin;

  if (!code) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('reason', 'missing_confirmation_code');
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('reason', 'confirmation_failed');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, origin));
}
