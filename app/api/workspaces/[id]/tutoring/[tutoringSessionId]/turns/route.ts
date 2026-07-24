import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { continueTutoringSession } from '@/lib/services/tutoring';
import { safeErrorResponse } from '@/lib/errors/safe-error';
import { z } from 'zod';
import { SECURITY_LIMITS } from '@/lib/security/limits';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';

const turnSchema = z.object({
  studentResponse: z.string().min(1, "Response cannot be empty").max(SECURITY_LIMITS.MAX_TUTORING_RESPONSE_LENGTH, 'Response is too long')
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; tutoringSessionId: string }> }
) {
  try {
    const { id, tutoringSessionId } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    enforceRateLimit(user.id, 'tutoring-turn', RATE_LIMITS.TUTORING);

    const body = await request.json();
    const parsed = turnSchema.parse(body);

    const result = await continueTutoringSession(id, user.id, tutoringSessionId, parsed.studentResponse);
    return NextResponse.json(result);
  } catch (err: unknown) {
    return safeErrorResponse(err);
  }
}
