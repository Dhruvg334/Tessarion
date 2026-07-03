import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { submitExplanation } from '@/lib/services/sessions';
import { executeTeachBack } from '@/lib/agents/teach-back-agent';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id, sessionId } = await context.params;
    const body = await request.json();
    const { content, provider = 'local' } = body;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This records the explanation in the DB and ensures no duplicates
    await submitExplanation(id, sessionId, user.id, content);

    // This orchestrates the gap detection and question generation
    const result = await executeTeachBack({
      workspaceId: id,
      sessionId,
      studentExplanation: content,
      provider
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    const status = (error as { statusCode?: number }).statusCode || 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
