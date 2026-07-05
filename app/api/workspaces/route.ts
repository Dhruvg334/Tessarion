import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { createWorkspaceSchema } from '@/lib/validation/schemas';
import * as workspaceService from '@/lib/services/workspaces';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/validation/api-response';

function safeError(err: unknown, fallback: string) {
  if (err instanceof AppError) {
    return errorResponse(err.message, err.statusCode, err.code);
  }
  console.error(err);
  return errorResponse(fallback);
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const workspaces = await workspaceService.listWorkspaces(user.id);
    return successResponse(workspaces);
  } catch (err) {
    return safeError(err, 'Failed to list workspaces');
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
    return safeError(err, 'Failed to create workspace');
  }
}
