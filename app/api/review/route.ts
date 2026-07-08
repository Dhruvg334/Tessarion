import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGlobalReviewQueue } from '@/lib/services/review';
import { AppError } from '@/lib/errors/app-error';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queue = await getGlobalReviewQueue(user.id);
    return NextResponse.json({ data: queue });
  } catch (err: unknown) {
    const error = err instanceof AppError ? err : new Error('Unknown error');
    const status = (error as AppError).statusCode || 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
