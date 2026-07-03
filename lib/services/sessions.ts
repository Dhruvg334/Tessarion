import { AppError } from '@/lib/errors/app-error';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { TeachBackSession, StudentExplanation, GapFinding, SocraticQuestion } from '@/types/database';
import { TeachBackSummary } from '@/lib/ai/types';

export async function startTeachBackSession(workspaceId: string, conceptNodeId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  
  // Verify workspace ownership
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (wsError || !workspace) {
    throw new AppError('UNAUTHORIZED', 403, 'Workspace ownership verification failed');
  }

  // Verify concept belongs to workspace
  const { data: concept, error: conceptError } = await supabase
    .from('concept_nodes')
    .select('id')
    .eq('id', conceptNodeId)
    .eq('workspace_id', workspaceId)
    .single();

  if (conceptError || !concept) {
    throw new AppError('NOT_FOUND', 404, 'Concept not found in workspace');
  }

  const { data: session, error } = await supabase
    .from('teach_back_sessions')
    .insert({
      workspace_id: workspaceId,
      concept_node_id: conceptNodeId,
      status: 'in_progress'
    })
    .select('*')
    .single();

  if (error) throw new AppError('DB_ERROR', 500, error.message);
  return session as TeachBackSession;
}

export async function getTeachBackSession(workspaceId: string, sessionId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (!ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');

  const { data: session, error } = await supabase
    .from('teach_back_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('workspace_id', workspaceId)
    .single();

  if (error || !session) throw new AppError('NOT_FOUND', 404, 'Session not found');
  return session as TeachBackSession;
}

export async function listTeachBackSessions(workspaceId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (!ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');

  const { data: sessions, error } = await supabase
    .from('teach_back_sessions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw new AppError('DB_ERROR', 500, error.message);
  return sessions as TeachBackSession[];
}

export async function submitExplanation(workspaceId: string, sessionId: string, userId: string, content: string) {
  if (!content || content.trim().length === 0) {
    throw new AppError('INVALID_INPUT', 400, 'Explanation cannot be empty');
  }

  const supabase = await createServerSupabaseClient();
  
  const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (!ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');

  const { data: session } = await supabase
    .from('teach_back_sessions')
    .select('id, status')
    .eq('id', sessionId)
    .eq('workspace_id', workspaceId)
    .single();

  if (!session) throw new AppError('NOT_FOUND', 404, 'Session not found');
  if (session.status !== 'in_progress') throw new AppError('INVALID_STATE', 400, 'Session is not in progress');

  // Idempotency: Check if explanation already submitted for this session
  const { data: existing } = await supabase
    .from('student_explanations')
    .select('id, content')
    .eq('session_id', sessionId)
    .order('sequence_index', { ascending: false })
    .limit(1);
    
  if (existing && existing.length > 0 && existing[0].content === content) {
    throw new AppError('DUPLICATE_SUBMISSION', 409, 'Explanation already submitted');
  }

  const { data: explanation, error } = await supabase
    .from('student_explanations')
    .insert({
      session_id: sessionId,
      content,
      sequence_index: existing && existing.length > 0 ? 2 : 1
    })
    .select('*')
    .single();

  if (error) throw new AppError('DB_ERROR', 500, error.message);
  return explanation as StudentExplanation;
}

export async function getSessionFeedback(workspaceId: string, sessionId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (!ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');

  const { data: gaps } = await supabase
    .from('gap_findings')
    .select('*')
    .eq('session_id', sessionId);

  const { data: questions } = await supabase
    .from('socratic_questions')
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence_index', { ascending: false })
    .limit(1);

  const { data: explanation } = await supabase
    .from('student_explanations')
    .select('content')
    .eq('session_id', sessionId)
    .single();

  return {
    explanation: explanation?.content || null,
    gaps: (gaps || []) as GapFinding[],
    question: (questions && questions.length > 0 ? questions[0] : null) as SocraticQuestion | null
  };
}

export async function abandonTeachBackSession(workspaceId: string, sessionId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (!ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');

  const { error } = await supabase
    .from('teach_back_sessions')
    .update({ status: 'abandoned' })
    .eq('id', sessionId)
    .eq('workspace_id', workspaceId);

  if (error) throw new AppError('DB_ERROR', 500, error.message);
  return { success: true };
}

// Background service methods (used by Agent)
export async function persistTeachBackFeedback(sessionId: string, summary: TeachBackSummary) {
  const supabase = createServiceClient();
  
  // Combine all gap findings to persist
  const allGaps = [...summary.gaps, ...summary.unsupportedClaims];
  
  if (allGaps.length > 0) {
    const gapsToInsert = allGaps.map(g => ({
      session_id: sessionId,
      gap_type: g.gapType,
      description: g.description,
      severity: g.severity,
      source_evidence: g.sourceEvidence,
      source_chunk_ids: g.sourceChunkIds,
      related_concept_id: g.relatedConceptId || null,
      confidence_score: g.confidenceScore,
      dismissed_by_student: false
    }));

    const { error: gapError } = await supabase.from('gap_findings').insert(gapsToInsert);
    if (gapError) throw new AppError('DB_ERROR', 500, gapError.message);
  }

  if (summary.followUpQuestion) {
    const q = summary.followUpQuestion;
    const { error: qError } = await supabase.from('socratic_questions').insert({
      session_id: sessionId,
      question_text: q.questionText,
      target_gap_id: q.targetGapId || null, // Will need matching if we want true foreign key relation, but for Phase 6 skipping strict relation is ok
      blooms_level: q.bloomsLevel,
      reasoning: q.reasoning,
      sequence_index: 1
    });
    if (qError) throw new AppError('DB_ERROR', 500, qError.message);
  }
  
  // Mark session as completed
  const { error: sessionError } = await supabase.from('teach_back_sessions').update({ 
    status: 'completed', 
    completed_at: new Date().toISOString() 
  }).eq('id', sessionId);
  
  if (sessionError) throw new AppError('DB_ERROR', 500, sessionError.message);
}
