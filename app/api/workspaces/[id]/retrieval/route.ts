/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { retrieveRelevantChunks } from '@/lib/services/retrieval';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/validation/api-response';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: workspaceId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    if (!body.query) return errorResponse('Missing query', 400);

    const chunks = await retrieveRelevantChunks(workspaceId, user.id, body.query, body.options);
    return successResponse(chunks);
  } catch (err: any) {
    return errorResponse(err.message || 'Retrieval failed');
  }
}
