/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SourceDocument } from '@/types/database';
import { chunkText } from '@/lib/rag/chunking';

export async function listDocuments(workspaceId: string, _userId: string): Promise<SourceDocument[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('source_documents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data as SourceDocument[];
}

export async function getDocument(documentId: string, workspaceId: string, _userId: string): Promise<SourceDocument> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('source_documents')
    .select('*')
    .eq('id', documentId)
    .eq('workspace_id', workspaceId)
    .single();

  if (error || !data) throw new Error('Document not found or unauthorized');
  return data as SourceDocument;
}

export async function createPastedDocument(workspaceId: string, userId: string, input: { file_name: string; content: string }): Promise<SourceDocument> {
  const supabase = await createServerSupabaseClient();
  
  const { data: doc, error: docError } = await supabase
    .from('source_documents')
    .insert({
      workspace_id: workspaceId,
      file_name: input.file_name,
      file_type: 'text/plain',
      file_size: Buffer.byteLength(input.content, 'utf8'),
      input_type: 'paste',
      processing_status: 'processing',
    })
    .select()
    .single();

  if (docError) throw docError;

  try {
    const chunksData = chunkText(input.content);
    await createSourceChunks(doc.id, workspaceId, chunksData);
    await updateDocumentProcessingStatus(doc.id, workspaceId, userId, {
      status: 'ready',
      chunk_count: chunksData.length
    });
    return getDocument(doc.id, workspaceId, userId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error during processing';
    await updateDocumentProcessingStatus(doc.id, workspaceId, userId, {
      status: 'failed',
      error_message: msg
    });
    throw err;
  }
}

export async function createUploadedDocumentRecord(_workspaceId: string, _userId: string, _input: unknown): Promise<SourceDocument> {
  throw new Error("501: File uploads to Supabase Storage are not implemented in Phase 3. Please use paste text.");
}

export async function updateDocumentProcessingStatus(
  documentId: string, 
  workspaceId: string, 
  _userId: string, 
  statusInput: { status: 'pending' | 'processing' | 'ready' | 'failed' | 'partial', chunk_count?: number, error_message?: string }
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const updateData: Record<string, unknown> = {
    processing_status: statusInput.status,
    processed_at: ['ready', 'failed', 'partial'].includes(statusInput.status) ? new Date().toISOString() : null,
  };
  
  if (statusInput.chunk_count !== undefined) updateData.chunk_count = statusInput.chunk_count;
  if (statusInput.error_message !== undefined) updateData.error_message = statusInput.error_message;

  const { error } = await supabase
    .from('source_documents')
    .update(updateData)
    .eq('id', documentId)
    .eq('workspace_id', workspaceId);

  if (error) throw error;
}

export async function deleteDocument(documentId: string, workspaceId: string, _userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('source_documents')
    .delete()
    .eq('id', documentId)
    .eq('workspace_id', workspaceId);

  if (error) throw error;
}

export async function createSourceChunks(documentId: string, workspaceId: string, chunks: import("@/lib/rag/chunking").ChunkResult[]): Promise<void> {
  // Using authenticated server client instead of service role
  const supabase = await createServerSupabaseClient();
  
  const insertRows = chunks.map(c => ({
    source_document_id: documentId,
    workspace_id: workspaceId,
    content: c.content,
    chunk_index: c.chunkIndex,
    char_start: c.charStart,
    char_end: c.charEnd,
    token_count: c.tokenCount,
    section_hint: c.sectionHint,
  }));

  const { error } = await supabase
    .from('source_chunks')
    .insert(insertRows);

  if (error) throw error;
}
