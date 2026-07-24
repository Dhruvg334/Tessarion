import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import * as documentService from '@/lib/services/documents';

function documentRouteError(err: unknown) {
  if (err instanceof AppError) {
    const message = err.statusCode === 500 ? 'Internal Server Error' : err.message;
    return NextResponse.json({ error: message }, { status: err.statusCode });
  }

  if (err instanceof Error && err.message.toLowerCase().includes('not found')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  console.error(err);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string, documentId: string }> }) {
  try {
    const { id: workspaceId, documentId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const doc = await documentService.getDocument(documentId, workspaceId, user.id);
    return NextResponse.json({ data: doc });
  } catch (err: unknown) {
    return documentRouteError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string, documentId: string }> }) {
  try {
    const { id: workspaceId, documentId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    await documentService.deleteDocument(documentId, workspaceId, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    return documentRouteError(err);
  }
}
