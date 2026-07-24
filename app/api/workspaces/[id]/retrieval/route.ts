import { createServerSupabaseClient } from '@/lib/supabase/server';
import { retrieveRelevantChunks } from '@/lib/services/retrieval';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/validation/api-response';

import { z } from 'zod';
import { SECURITY_LIMITS } from '@/lib/security/limits';
import { enforceRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';

const RetrievalSchema = z.object({
  query: z.string().min(1, 'Query is required').max(SECURITY_LIMITS.MAX_RETRIEVAL_QUERY_LENGTH, 'Query is too long'),
  options: z.any().optional() // simplified for now
});

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: workspaceId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    enforceRateLimit(user.id, 'retrieval', RATE_LIMITS.RETRIEVAL);

    const body = await _request.json();
    const parsed = RetrievalSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Validation error', 400);
    }

    const { query, options } = parsed.data;

    const chunks = await retrieveRelevantChunks(workspaceId, user.id, query, options);
    return successResponse(chunks);
  } catch (err: unknown) {
    console.error(err);
    return errorResponse('Retrieval failed');
  }
}
