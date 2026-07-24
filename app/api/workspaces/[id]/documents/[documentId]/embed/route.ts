import { createServerSupabaseClient } from '@/lib/supabase/server';
import { embedMissingChunksForWorkspace } from '@/lib/services/embeddings';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/validation/api-response';

export async function POST(request: Request, { params }: { params: Promise<{ id: string, documentId: string }> }) {
  try {
    const { id: workspaceId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const result = await embedMissingChunksForWorkspace(workspaceId, user.id);
    return successResponse(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to embed';
    return errorResponse(msg);
  }
}
