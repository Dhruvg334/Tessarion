/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetrievedChunk } from '@/lib/rag/types';
import { generateQueryEmbedding } from '@/lib/ai/tasks/embedding-generation';
import { calculateRetrievalConfidence, filterLowConfidenceChunks, reciprocalRankFusion } from '@/lib/rag/retrieval';
import { AppError } from '@/lib/errors/app-error';

export async function retrieveDenseChunks(workspaceId: string, userId: string, query: string, options: any = {}): Promise<RetrievedChunk[]> {
  const supabase = await createServerSupabaseClient();
  const embedding = await generateQueryEmbedding(query);
  const matchCount = options.limit || 5;

  const { data, error } = await supabase.rpc('match_source_chunks_dense', {
    query_embedding: `[${embedding.join(',')}]`,
    match_workspace_id: workspaceId,
    match_threshold: 0.2,
    match_count: matchCount
  });

  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id,
    sourceDocumentId: c.source_document_id,
    workspaceId: c.workspace_id,
    content: c.content,
    chunkIndex: c.chunk_index,
    tokenCount: c.token_count,
    sectionHint: c.section_hint,
    similarity: c.similarity,
    confidence: calculateRetrievalConfidence({ similarity: c.similarity }).score
  }));
}

export async function retrieveSparseChunks(workspaceId: string, userId: string, query: string, options: any = {}): Promise<RetrievedChunk[]> {
  const supabase = await createServerSupabaseClient();
  const matchCount = options.limit || 5;

  const { data, error } = await supabase.rpc('match_source_chunks_sparse', {
    query_text: query,
    match_workspace_id: workspaceId,
    match_count: matchCount
  });

  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id,
    sourceDocumentId: c.source_document_id,
    workspaceId: c.workspace_id,
    content: c.content,
    chunkIndex: c.chunk_index,
    tokenCount: c.token_count,
    sectionHint: c.section_hint,
    sparseRank: c.rank,
    confidence: calculateRetrievalConfidence({}).score
  }));
}

export async function retrieveHybridChunks(workspaceId: string, userId: string, query: string, options: any = {}): Promise<RetrievedChunk[]> {
  const supabase = await createServerSupabaseClient();
  
  let embedding: number[] = [];
  try {
    embedding = await generateQueryEmbedding(query);
  } catch (err) {
    console.warn('Embedding generation failed; using sparse retrieval fallback', err);
    return retrieveSparseChunks(workspaceId, userId, query, options);
  }

  const { data, error } = await supabase.rpc('match_source_chunks_hybrid', {
    query_text: query,
    query_embedding: `[${embedding.join(',')}]`,
    match_workspace_id: workspaceId,
    match_count: options.limit || 5,
    rrf_k: 60
  });

  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id,
    sourceDocumentId: c.source_document_id,
    workspaceId: c.workspace_id,
    content: c.content,
    chunkIndex: c.chunk_index,
    tokenCount: c.token_count,
    sectionHint: c.section_hint,
    denseRank: c.dense_rank,
    sparseRank: c.sparse_rank,
    rrfScore: c.rrf_score,
    confidence: calculateRetrievalConfidence({ rrfScore: c.rrf_score }).score
  }));
}

export async function retrieveRelevantChunks(workspaceId: string, userId: string, query: string, options: any = {}) {
  const mode = options.mode || 'hybrid';
  let chunks: RetrievedChunk[] = [];
  
  if (mode === 'dense') chunks = await retrieveDenseChunks(workspaceId, userId, query, options);
  else if (mode === 'sparse') chunks = await retrieveSparseChunks(workspaceId, userId, query, options);
  else chunks = await retrieveHybridChunks(workspaceId, userId, query, options);

  return filterLowConfidenceChunks(chunks, options.confidenceThreshold || 0.1);
}
