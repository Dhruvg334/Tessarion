import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTutoringSession, completeTutoringSession } from '@/lib/services/tutoring';
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
    const error = err instanceof Error ? err : new Error('Unknown error');
    const status = (error as { statusCode?: number }).statusCode || 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
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
      const { data, error } = await supabase
        .from('tutoring_sessions')
        .update({ status: 'abandoned', updated_at: new Date().toISOString() })
        .eq('id', tutoringSessionId)
        .eq('workspace_id', id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw new Error(error.message); // Will return 500
      return NextResponse.json(data);
    }
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
