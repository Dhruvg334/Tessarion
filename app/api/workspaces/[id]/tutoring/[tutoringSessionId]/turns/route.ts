import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { continueTutoringSession } from '@/lib/services/tutoring';
import { z } from 'zod';

const turnSchema = z.object({
  studentResponse: z.string().min(1, "Response cannot be empty")
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

    const body = await request.json();
    const parsed = turnSchema.parse(body);

    const result = await continueTutoringSession(id, user.id, tutoringSessionId, parsed.studentResponse);
    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const error = err instanceof Error ? err : new Error('Unknown error');
    const status = (error as { statusCode?: number }).statusCode || 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
