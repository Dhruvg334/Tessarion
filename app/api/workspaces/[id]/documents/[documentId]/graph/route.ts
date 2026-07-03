import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateGraphSchema } from '@/lib/validation/schemas';
import { buildConceptGraphAgent } from '@/lib/agents/concept-graph-builder';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workspaceId, documentId } = await params;

    // Verify workspace and document ownership
    const { data: doc, error: docError } = await supabase
      .from('source_documents')
      .select('id, workspace_id')
      .eq('id', documentId)
      .eq('workspace_id', workspaceId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Parse options
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // empty body is fine
    }

    const parsed = generateGraphSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    // Fetch chunks
    const { data: chunks, error: chunkError } = await supabase
      .from('source_chunks')
      .select('*')
      .eq('source_document_id', documentId);

    if (chunkError) {
      return NextResponse.json({ error: 'Failed to fetch chunks' }, { status: 500 });
    }

    // Run agent (the agent builds concepts AND relationships/graph)
    const result = await buildConceptGraphAgent(workspaceId, user.id, chunks || [], parsed.data);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in graph generation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
