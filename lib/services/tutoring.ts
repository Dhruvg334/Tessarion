import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { TutoringSession, TutoringTurn, TutoringFocusType } from '@/lib/tutoring/types';
import { decideNextMove } from '@/lib/tutoring/decide-next-move';
import { generateTutorMessage } from '@/lib/tutoring/generate-tutor-message';

import { mapReviewReasonToTutoringFocus } from '@/lib/tutoring/types';

export interface StartTutoringSessionParams {
  workspaceId: string;
  userId: string;
  conceptId: string;
  teachBackSessionId?: string;
  reviewScheduleId?: string;
  focusType?: TutoringFocusType;
  focusSummary?: string;
}

export async function startTutoringSession(params: StartTutoringSessionParams): Promise<{ session: TutoringSession; turn: TutoringTurn }> {
  const supabase = await createServerSupabaseClient();
  const { workspaceId, userId, conceptId } = params;

  // Verify workspace access
  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (wsError || !ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');

  // Verify concept exists in workspace
  const { data: concept, error: cError } = await supabase
    .from('concept_nodes')
    .select('id, name')
    .eq('id', conceptId)
    .eq('workspace_id', workspaceId)
    .single();

  if (cError || !concept) throw new AppError('INVALID_SCOPE', 400, 'Concept not found in workspace');

  // If IDs provided, verify they exist in this workspace/user
  if (params.teachBackSessionId) {
    const { data: tb, error: tbError } = await supabase
      .from('teach_back_sessions')
      .select('id')
      .eq('id', params.teachBackSessionId)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();
    if (tbError || !tb) throw new AppError('INVALID_SCOPE', 400, 'Invalid teach back session');
  }

  let reviewReasonType: string | undefined;
  if (params.reviewScheduleId) {
    const { data: rs, error: rsError } = await supabase
      .from('review_schedules')
      .select('id, reason_type, reason')
      .eq('id', params.reviewScheduleId)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();
    if (rsError || !rs) throw new AppError('INVALID_SCOPE', 400, 'Invalid review schedule');
    reviewReasonType = rs.reason_type;
  }

  // Determine focus
  let focusType = params.focusType;
  let focusSummary = params.focusSummary;

  if (!focusType) {
    if (reviewReasonType) {
      focusType = mapReviewReasonToTutoringFocus(reviewReasonType);
    } else {
      // If we had time, we could query the latest mastery_records.
      // For now, default to shallow_explanation
      focusType = 'shallow_explanation';
    }
  }

  if (!focusSummary) {
    focusSummary = 'Guided concept review and clarification.';
  }

  // Fetch Source Grounding Context
  const { data: rels } = await supabase
    .from('concept_source_relationships')
    .select('source_chunk_id')
    .eq('concept_node_id', conceptId);
    
  const chunkIds = (rels || []).map(r => r.source_chunk_id);
  
  let sourceChunksText = '';
  if (chunkIds.length > 0) {
    const { data: chunks } = await supabase
      .from('source_chunks')
      .select('content')
      .in('id', chunkIds);
      
    if (chunks && chunks.length > 0) {
      sourceChunksText = chunks.map(c => c.content).join('\n\n');
    }
  }

  const { data: sessionData, error: sError } = await supabase
    .from('tutoring_sessions')
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      concept_node_id: conceptId,
      teach_back_session_id: params.teachBackSessionId || null,
      review_schedule_id: params.reviewScheduleId || null,
      focus_type: focusType,
      focus_summary: focusSummary,
      status: 'active',
      max_turns: 6,
      current_turn_count: 0
    })
    .select()
    .single();

  if (sError) throw new AppError('DB_ERROR', 500, sError.message);
  
  const session = mapSession(sessionData);

  // Generate initial tutor turn
  const decision = decideNextMove({
    session,
    previousTurns: [],
    availableSourceChunkIds: chunkIds,
  });

  const question = await generateTutorMessage({
    session,
    decision,
    previousTurns: [],
    sourceChunksText
  });

  const { data: turnData, error: tError } = await supabase
    .from('tutoring_turns')
    .insert({
      tutoring_session_id: session.id,
      workspace_id: workspaceId,
      user_id: userId,
      role: 'tutor',
      turn_type: 'socratic_question',
      content: question,
      source_chunk_ids: chunkIds,
      tutor_move: decision.nextMove,
    })
    .select()
    .single();

  if (tError) throw new AppError('DB_ERROR', 500, tError.message);

  return { session, turn: mapTurn(turnData) };
}

export async function getTutoringSession(workspaceId: string, userId: string, sessionId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: sessionData, error: sError } = await supabase
    .from('tutoring_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (sError || !sessionData) throw new AppError('NOT_FOUND', 404, 'Session not found');

  const { data: turnsData, error: tError } = await supabase
    .from('tutoring_turns')
    .select('*')
    .eq('tutoring_session_id', sessionId)
    .order('created_at', { ascending: true });

  if (tError) throw new AppError('DB_ERROR', 500, tError.message);

  return {
    session: mapSession(sessionData),
    turns: turnsData.map(mapTurn)
  };
}

export async function continueTutoringSession(workspaceId: string, userId: string, sessionId: string, studentResponse: string) {
  const supabase = await createServerSupabaseClient();
  const { session, turns } = await getTutoringSession(workspaceId, userId, sessionId);

  if (session.status !== 'active') {
    throw new AppError('BAD_REQUEST', 400, 'Tutoring session is not active');
  }

  // Insert student turn
  const { data: studentTurnData, error: stError } = await supabase
    .from('tutoring_turns')
    .insert({
      tutoring_session_id: sessionId,
      workspace_id: workspaceId,
      user_id: userId,
      role: 'student',
      turn_type: 'student_response',
      content: studentResponse,
    })
    .select()
    .single();

  if (stError) throw new AppError('DB_ERROR', 500, stError.message);

  const newTurns = [...turns, mapTurn(studentTurnData)];

  // Fetch Source Grounding Context
  const { data: rels } = await supabase
    .from('concept_source_relationships')
    .select('source_chunk_id')
    .eq('concept_node_id', session.conceptId);
    
  const chunkIds = (rels || []).map(r => r.source_chunk_id);
  
  let sourceChunksText = '';
  if (chunkIds.length > 0) {
    const { data: chunks } = await supabase
      .from('source_chunks')
      .select('content')
      .in('id', chunkIds);
      
    if (chunks && chunks.length > 0) {
      sourceChunksText = chunks.map(c => c.content).join('\n\n');
    }
  }

  // Decide next move
  const decision = decideNextMove({
    session,
    previousTurns: newTurns,
    availableSourceChunkIds: chunkIds,
  });

  const question = await generateTutorMessage({
    session,
    decision,
    previousTurns: newTurns,
    sourceChunksText
  });

  const nextStatus = decision.shouldCompleteSession ? (decision.nextMove === 'summarize_progress' ? 'needs_review' : 'completed') : 'active';
  const newTurnCount = session.currentTurnCount + 1;

  // Update session
  const { data: updatedSessionData, error: uError } = await supabase
    .from('tutoring_sessions')
    .update({ 
      current_turn_count: newTurnCount,
      status: nextStatus,
      updated_at: new Date().toISOString(),
      ...(decision.shouldCompleteSession ? { completed_at: new Date().toISOString() } : {})
    })
    .eq('id', sessionId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .select()
    .single();

  if (uError) throw new AppError('DB_ERROR', 500, uError.message);

  // Insert tutor turn
  const { data: tutorTurnData, error: ttError } = await supabase
    .from('tutoring_turns')
    .insert({
      tutoring_session_id: sessionId,
      workspace_id: workspaceId,
      user_id: userId,
      role: 'tutor',
      turn_type: decision.nextMove === 'ask_correction' ? 'correction_prompt' : decision.nextMove === 'provide_small_hint' ? 'hint' : decision.nextMove === 'summarize_progress' ? 'summary' : 'socratic_question',
      content: question,
      source_chunk_ids: chunkIds,
      tutor_move: decision.nextMove,
    })
    .select()
    .single();

  if (ttError) throw new AppError('DB_ERROR', 500, ttError.message);

  return {
    session: mapSession(updatedSessionData),
    newTurns: [mapTurn(studentTurnData), mapTurn(tutorTurnData)],
    decision
  };
}

export async function completeTutoringSession(workspaceId: string, userId: string, sessionId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('tutoring_sessions')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .select('id, status');

  if (error) throw new AppError('DB_ERROR', 500, error.message);
  if (!data || data.length === 0) throw new AppError('NOT_FOUND', 404, 'Session not found or unauthorized');

  return data[0];
}

export async function abandonTutoringSession(workspaceId: string, userId: string, sessionId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('tutoring_sessions')
    .update({ 
      status: 'abandoned',
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .select('id, status');

  if (error) throw new AppError('DB_ERROR', 500, error.message);
  if (!data || data.length === 0) throw new AppError('NOT_FOUND', 404, 'Session not found or unauthorized');

  return data[0];
}

export async function listWorkspaceTutoringSessions(workspaceId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('tutoring_sessions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new AppError('DB_ERROR', 500, error.message);
  return data.map(mapSession);
}

// Map DB row to application type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSession(row: any): TutoringSession {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    conceptId: row.concept_node_id,
    teachBackSessionId: row.teach_back_session_id,
    reviewScheduleId: row.review_schedule_id,
    focusType: row.focus_type as TutoringFocusType,
    focusSummary: row.focus_summary,
    status: row.status,
    maxTurns: row.max_turns,
    currentTurnCount: row.current_turn_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTurn(row: any): TutoringTurn {
  return {
    id: row.id,
    tutoringSessionId: row.tutoring_session_id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    role: row.role,
    turnType: row.turn_type,
    content: row.content,
    sourceChunkIds: row.source_chunk_ids || [],
    gapFindingIds: row.gap_finding_ids || [],
    masterySignalIds: row.mastery_signal_ids || [],
    tutorMove: row.tutor_move,
    createdAt: row.created_at
  };
}
