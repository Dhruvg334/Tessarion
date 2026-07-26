import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { safeErrorResponse } from '@/lib/errors/safe-error';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: workspaceId } = await context.params;
    const ids = [...new Set((request.nextUrl.searchParams.get('ids') || '').split(',').map((value) => value.trim()).filter((value) => UUID_PATTERN.test(value)))].slice(0, 12);
    if (ids.length === 0) return NextResponse.json({ data: [] });

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: workspace } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', user.id).maybeSingle();
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

    const { data: chunks, error } = await supabase
      .from('source_chunks')
      .select('id, source_document_id, chunk_index, section_hint, token_count, content')
      .eq('workspace_id', workspaceId)
      .in('id', ids);
    if (error) throw error;

    const documentIds = [...new Set((chunks ?? []).map((chunk) => chunk.source_document_id))];
    const { data: documents } = documentIds.length
      ? await supabase.from('source_documents').select('id, file_name').eq('workspace_id', workspaceId).in('id', documentIds)
      : { data: [] as Array<{ id: string; file_name: string }> };
    const names = new Map((documents ?? []).map((document) => [document.id, document.file_name]));

    return NextResponse.json({
      data: (chunks ?? []).map((chunk) => ({
        id: chunk.id,
        sourceDocumentId: chunk.source_document_id,
        documentName: names.get(chunk.source_document_id) || 'Source document',
        chunkIndex: chunk.chunk_index,
        sectionHint: chunk.section_hint,
        tokenCount: chunk.token_count,
        content: chunk.content,
      })),
    });
  } catch (error: unknown) {
    return safeErrorResponse(error);
  }
}
