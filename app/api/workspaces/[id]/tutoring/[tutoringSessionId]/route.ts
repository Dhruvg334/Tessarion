import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTutoringSession, completeTutoringSession, abandonTutoringSession } from '@/lib/services/tutoring';
import { safeErrorResponse } from '@/lib/errors/safe-error';
import { z } from 'zod';

export async function GET(
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

    const session = await getTutoringSession(id, user.id, tutoringSessionId);
    return NextResponse.json(session);
  } catch (err: unknown) {
    return safeErrorResponse(err);
  }
}

const patchSchema = z.object({
  action: z.enum(['complete', 'abandon'])
});

export async function PATCH(
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

    const body = await request.json();
    const parsed = patchSchema.parse(body);

    if (parsed.action === 'complete') {
      const result = await completeTutoringSession(id, user.id, tutoringSessionId);
      return NextResponse.json(result);
    } else {
      // Abandon
      const result = await abandonTutoringSession(id, user.id, tutoringSessionId);
      return NextResponse.json(result);
    }
  } catch (err: unknown) {
    return safeErrorResponse(err);
  }
}
