import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createWorkspaceSchema } from '@/lib/validation/schemas';
import * as workspaceService from '@/lib/services/workspaces';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/validation/api-response';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const workspaces = await workspaceService.listWorkspaces(user.id);
    return successResponse(workspaces);
  } catch (err) {
    console.error(err);
    return errorResponse('Failed to list workspaces');
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error.format());

    const workspace = await workspaceService.createWorkspace(user.id, parsed.data);
    return successResponse(workspace, 201);
  } catch (err) {
    console.error(err);
    return errorResponse('Failed to create workspace');
  }
}
