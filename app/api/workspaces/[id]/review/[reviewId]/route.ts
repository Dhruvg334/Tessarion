import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { markReviewCompleted, skipReview } from '@/lib/services/review';
import { z } from 'zod';
import { AppError } from '@/lib/errors/app-error';

const PatchSchema = z.object({
  action: z.enum(['complete', 'skip'])
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id, reviewId } = await context.params;
    const body = await request.json();
    const result_parsed = PatchSchema.safeParse(body);
    if (!result_parsed.success) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    const { action } = result_parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'complete') {
      await markReviewCompleted(id, reviewId, user.id);
    } else {
      await skipReview(id, reviewId, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err instanceof AppError ? err : new Error('Unknown error');
    const status = (error as AppError).statusCode || 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
