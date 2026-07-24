import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { safeErrorResponse } from '@/lib/errors/safe-error';

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

    // Limit to 50 most recent events for minimal UI
    const { data, error } = await supabase
      .from('operational_events')
      .select('id, event_type, safe_message, entity_type, entity_id, created_at')
      .eq('workspace_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    return safeErrorResponse(err);
  }
}
