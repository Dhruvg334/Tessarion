import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getWorkspaceGraph } from '@/lib/services/graph';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workspaceId } = await params;
    const graph = await getWorkspaceGraph(workspaceId, user.id);
    return NextResponse.json({ graph });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('Error fetching graph:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
