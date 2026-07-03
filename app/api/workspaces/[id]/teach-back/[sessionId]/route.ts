import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTeachBackSession, getSessionFeedback } from '@/lib/services/sessions';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id, sessionId } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getTeachBackSession(id, sessionId, user.id);
    const feedback = await getSessionFeedback(id, sessionId, user.id);
    
    return NextResponse.json({
      session,
      feedback
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
