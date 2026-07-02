import { createServerSupabaseClient } from '@/lib/supabase/server';
import { pasteDocumentSchema } from '@/lib/validation/schemas';
import * as documentService from '@/lib/services/documents';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/validation/api-response';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: workspaceId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const documents = await documentService.listDocuments(workspaceId, user.id);
    return successResponse(documents);
  } catch (err) {
    console.error(err);
    return errorResponse('Failed to fetch documents');
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: workspaceId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = pasteDocumentSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error.format());

    const doc = await documentService.createPastedDocument(workspaceId, user.id, parsed.data);
    return successResponse(doc, 201);
  } catch (err) {
    console.error(err);
    return errorResponse('Failed to process document');
  }
}
