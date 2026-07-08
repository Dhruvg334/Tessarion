import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { submitExplanation } from '@/lib/services/sessions';
import { executeTeachBack } from '@/lib/agents/teach-back-agent';
import { z } from 'zod';

const RequestSchema = z.object({
  content: z.string().min(1, 'Explanation cannot be empty'),
  provider: z.enum(['local', 'gemini']).default('local')
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id, sessionId } = await context.params;
    const body = await request.json();
    const result_parsed = RequestSchema.safeParse(body);
    if (!result_parsed.success) {
      return NextResponse.json({ error: result_parsed.error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    const { content, provider } = result_parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This records the explanation in the DB and ensures no duplicates
    // Returns the persisted explanation row with its real DB id
    const explanation = await submitExplanation(id, sessionId, user.id, content);

    // This orchestrates the gap detection and question generation
    // Pass the real persisted explanation ID, not "latest" or an index
    const result = await executeTeachBack({
      workspaceId: id,
      sessionId,
      userId: user.id,
      studentExplanation: content,
      explanationId: explanation.id,
      provider
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    const status = (error as { statusCode?: number }).statusCode || 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
