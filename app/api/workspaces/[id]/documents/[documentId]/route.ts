import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import * as documentService from '@/lib/services/documents';

export async function GET(request: Request, { params }: { params: Promise<{ id: string, documentId: string }> }) {
  try {
    const { id: workspaceId, documentId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const doc = await documentService.getDocument(documentId, workspaceId, user.id);
    return NextResponse.json({ data: doc });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('not found')) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, documentId: string }> }) {
  try {
    const { id: workspaceId, documentId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    await documentService.deleteDocument(documentId, workspaceId, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
