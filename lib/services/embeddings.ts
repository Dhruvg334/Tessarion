/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateDocumentEmbeddings } from '@/lib/ai/tasks/embedding-generation';
import { AppError } from '@/lib/errors/app-error';

export async function embedMissingChunksForWorkspace(workspaceId: string, userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (wsError || !workspace) {
    throw new AppError('Workspace not found or unauthorized', 403, 'UNAUTHORIZED');
  }

  const { data: chunks, error: chunksError } = await supabase
    .from('source_chunks')
    .select('id, content')
    .eq('workspace_id', workspaceId)
    .is('embedding', null)
    .limit(100);

  if (chunksError) throw chunksError;
  if (!chunks || chunks.length === 0) return { embedded: 0 };

  const texts = chunks.map(c => c.content);
  const embeddings = await generateDocumentEmbeddings(texts);

  for (let i = 0; i < chunks.length; i++) {
    const { error: updateError } = await supabase
      .from('source_chunks')
      .update({ embedding: `[${embeddings[i].join(',')}]` as any })
      .eq('id', chunks[i].id)
      .eq('workspace_id', workspaceId);
    if (updateError) throw updateError;
  }

  return { embedded: chunks.length };
}

export async function embedDocumentChunks(workspaceId: string, documentId: string, userId: string) {
  throw new AppError('NOT_IMPLEMENTED', 501, 'NOT_IMPLEMENTED');
}

export async function getEmbeddingStatus(workspaceId: string, documentId: string, userId: string) {
  throw new AppError('NOT_IMPLEMENTED', 501, 'NOT_IMPLEMENTED');
}
