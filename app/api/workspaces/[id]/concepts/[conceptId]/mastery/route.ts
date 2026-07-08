import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getConceptMastery } from '@/lib/services/mastery';
import { AppError } from '@/lib/errors/app-error';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; conceptId: string }> }
) {
  try {
    const { id: workspaceId, conceptId } = await params;
    if (!workspaceId || !conceptId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mastery = await getConceptMastery(workspaceId, conceptId, user.id);
    if (!mastery) {
      return NextResponse.json({ error: 'Mastery record not found' }, { status: 404 });
    }
    return NextResponse.json({ data: mastery });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
