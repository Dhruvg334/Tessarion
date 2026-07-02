import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createWorkspaceSchema } from '@/lib/validation/schemas';
import * as workspaceService from '@/lib/services/workspaces';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const workspaces = await workspaceService.listWorkspaces(user.id);
    return NextResponse.json({ data: workspaces });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const body = await request.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const workspace = await workspaceService.createWorkspace(user.id, parsed.data);
    return NextResponse.json({ data: workspace }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}
