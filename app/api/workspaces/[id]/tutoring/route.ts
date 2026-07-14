import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { listWorkspaceTutoringSessions, startTutoringSession } from '@/lib/services/tutoring';
import { z } from 'zod';
import { TutoringFocusType } from '@/lib/tutoring/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await listWorkspaceTutoringSessions(id, user.id);
    return NextResponse.json(sessions);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    const status = (error as { statusCode?: number }).statusCode || 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}

const startSessionSchema = z.object({
  conceptId: z.string().uuid(),
  teachBackSessionId: z.string().uuid().optional(),
  reviewScheduleId: z.string().uuid().optional(),
  focusType: z.enum([
    'misconception', 
    'missing_concept', 
    'weak_connection', 
    'shallow_explanation', 
    'unsupported_claim', 
    'prerequisite_gap', 
    'review_reinforcement'
  ]).optional(),
  focusSummary: z.string().optional()
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = startSessionSchema.parse(body);

    const result = await startTutoringSession({
      workspaceId: id,
      userId: user.id,
      conceptId: parsed.conceptId,
      teachBackSessionId: parsed.teachBackSessionId,
      reviewScheduleId: parsed.reviewScheduleId,
      focusType: parsed.focusType as TutoringFocusType,
      focusSummary: parsed.focusSummary
    });

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
