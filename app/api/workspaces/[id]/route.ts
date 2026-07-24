import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { updateWorkspaceSchema } from '@/lib/validation/schemas';
import * as workspaceService from '@/lib/services/workspaces';

function safeWorkspaceError(err: unknown) {
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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const workspace = await workspaceService.getWorkspace(id, user.id);
    return NextResponse.json({ data: workspace });
  } catch (err: unknown) {
    return safeWorkspaceError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const body = await request.json();
    const parsed = updateWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const workspace = await workspaceService.updateWorkspace(id, user.id, parsed.data);
    return NextResponse.json({ data: workspace });
  } catch (err: unknown) {
    return safeWorkspaceError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    await workspaceService.archiveWorkspace(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    return safeWorkspaceError(err);
  }
}
