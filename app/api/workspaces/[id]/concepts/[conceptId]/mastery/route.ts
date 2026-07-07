import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getConceptMastery } from '@/lib/services/mastery';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; conceptId: string }> }
) {
  try {
    const { id: workspaceId, conceptId } = await params;
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
