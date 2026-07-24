import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { TutoringSession, TutoringTurn, TutoringFocusType } from '@/lib/tutoring/types';
import { decideNextMove } from '@/lib/tutoring/decide-next-move';
import { generateTutorMessage } from '@/lib/tutoring/generate-tutor-message';

import { mapReviewReasonToTutoringFocus } from '@/lib/tutoring/types';
import { recordOperationalEvent } from './observability';

interface TutoringEvidenceContextParams {
  workspaceId: string;
  userId: string;
  conceptId: string;
  teachBackSessionId?: string | null;
}

interface TutoringEvidenceContext {
  concept: { id: string; name: string; source_chunk_ids: string[] };
  sourceChunkIds: string[];
  sourceChunksText: string;
  gapFindingIds: string[];
  masterySignalIds: string[];
  hasSourceEvidence: boolean;
}

export async function loadTutoringEvidenceContext(params: TutoringEvidenceContextParams): Promise<TutoringEvidenceContext> {
  const supabase = await createServerSupabaseClient();
  const { workspaceId, userId, conceptId, teachBackSessionId } = params;

  const { data: concept, error: cError } = await supabase
    .from('concept_nodes')
    .select('id, name, source_chunk_ids')
    .eq('id', conceptId)
    .eq('workspace_id', workspaceId)
    .single();

  if (cError || !concept) throw new AppError('INVALID_SCOPE', 400, 'Concept not found in workspace');

  const chunkIds = new Set<string>(concept.source_chunk_ids || []);
  const gapFindingIds: string[] = [];
  const masterySignalIds: string[] = [];

  if (teachBackSessionId) {
    const { data: gaps, error: gapsError } = await supabase
      .from('gap_findings')
      .select('id, source_chunk_ids')
      .eq('session_id', teachBackSessionId);

    if (gapsError) throw new AppError('DB_ERROR', 500, 'Failed to load tutoring gap context');

    if (gaps) {
      for (const gap of gaps) {
        gapFindingIds.push(gap.id);
        if (gap.source_chunk_ids) {
          gap.source_chunk_ids.forEach((id: string) => chunkIds.add(id));
        }
      }
    }
  }

  const { data: signals, error: signalsError } = await supabase
    .from('mastery_signals')
    .select('id, source_chunk_ids')
    .eq('concept_id', conceptId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (signalsError) throw new AppError('DB_ERROR', 500, 'Failed to load tutoring mastery context');

  if (signals) {
    for (const signal of signals) {
      masterySignalIds.push(signal.id);
      if (signal.source_chunk_ids) {
        signal.source_chunk_ids.forEach((id: string) => chunkIds.add(id));
      }
    }
  }

  const requestedChunkIds = Array.from(chunkIds);
  let sourceChunksText = '';
  let resolvedChunkIds: string[] = [];

  if (requestedChunkIds.length > 0) {
    const { data: chunks, error: chunksError } = await supabase
      .from('source_chunks')
      .select('id, content')
      .eq('workspace_id', workspaceId)
      .in('id', requestedChunkIds);

    if (chunksError) throw new AppError('DB_ERROR', 500, 'Failed to load tutoring source context');

    if (chunks && chunks.length > 0) {
      resolvedChunkIds = chunks.map((chunk: { id: string }) => chunk.id);
      sourceChunksText = chunks.map((chunk: { content: string }) => chunk.content).join('\n\n');
    }
  }

  return {
    concept,
    sourceChunkIds: resolvedChunkIds,
    sourceChunksText,
    gapFindingIds,
    masterySignalIds,
    hasSourceEvidence: resolvedChunkIds.length > 0
  };
}

import { SECURITY_LIMITS } from '@/lib/security/limits';

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

  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (wsError || !ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');

  const { count: activeCount, error: activeError } = await supabase
    .from('tutoring_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('status', 'active');
    
  if (activeError) throw new AppError('DB_ERROR', 500, 'Failed to check active sessions');
  if (activeCount !== null && activeCount >= SECURITY_LIMITS.MAX_ACTIVE_TUTORING_SESSIONS) {
    throw new AppError('Too many active tutoring sessions', 400, 'LIMIT_EXCEEDED');
  }

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
      .select('id, reason_type, reason, concept_node_id')
      .eq('id', params.reviewScheduleId)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('concept_node_id', conceptId)
      .single();
    if (rsError || !rs) throw new AppError('INVALID_SCOPE', 400, 'Invalid review schedule');
    reviewReasonType = rs.reason_type;
  }

  const context = await loadTutoringEvidenceContext({
    workspaceId,
    userId,
    conceptId,
    teachBackSessionId: params.teachBackSessionId
  });

  let focusType = params.focusType;
  let focusSummary = params.focusSummary;

  if (!focusType) {
    if (reviewReasonType) {
      focusType = mapReviewReasonToTutoringFocus(reviewReasonType);
    } else if (params.teachBackSessionId) {
      const { data: gap, error: gapError } = await supabase
        .from('gap_findings')
        .select('gap_type')
        .eq('session_id', params.teachBackSessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (gapError) throw new AppError('DB_ERROR', 500, 'Failed to derive tutoring focus');
      if (gap && gap.gap_type) {
         if (gap.gap_type === 'missing_concept') focusType = 'missing_concept';
         else if (gap.gap_type === 'misconception') focusType = 'misconception';
         else if (gap.gap_type === 'weak_connection') focusType = 'weak_connection';
         else focusType = 'shallow_explanation';
      }
    } else {
      const { data: signal, error: signalError } = await supabase
        .from('mastery_signals')
        .select('signal_type')
        .eq('concept_id', conceptId)
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (signalError) throw new AppError('DB_ERROR', 500, 'Failed to derive tutoring focus');

      if (signal && signal.signal_type) {
         if (signal.signal_type === 'negative') focusType = 'misconception';
         else focusType = 'shallow_explanation';
      } else {
         focusType = 'shallow_explanation';
      }
    }
  }

  if (!focusType) focusType = 'shallow_explanation';
  
  if (!focusSummary) {
    focusSummary = 'Guided concept review and clarification.';
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

  const decision = decideNextMove({
    session,
    previousTurns: [],
    availableSourceChunkIds: context.sourceChunkIds,
  });
  
  if (!context.hasSourceEvidence) {
     decision.question = 'I don\'t have enough source material available to guide you on this concept. Could you provide more notes or documents for us to work from?';
  }

  const question = context.hasSourceEvidence ? await generateTutorMessage({
    session,
    decision,
    previousTurns: [],
    sourceChunksText: context.sourceChunksText
  }) : decision.question;

  const { data: turnData, error: tError } = await supabase
    .from('tutoring_turns')
    .insert({
      tutoring_session_id: session.id,
      workspace_id: workspaceId,
      user_id: userId,
      role: 'tutor',
      turn_type: 'socratic_question',
      content: question,
      source_chunk_ids: context.sourceChunkIds,
      gap_finding_ids: context.gapFindingIds,
      mastery_signal_ids: context.masterySignalIds,
      tutor_move: decision.nextMove,
    })
    .select()
    .single();

  if (tError) throw new AppError('DB_ERROR', 500, tError.message);

  await recordOperationalEvent({
    workspaceId,
    userId,
    eventType: 'tutoring_started',
    safeMessage: 'Started Socratic tutoring session',
    entityType: 'tutoring_session',
    entityId: session.id,
    metadata: { conceptId, focusType, teachBackSessionId: params.teachBackSessionId }
  });

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

  const context = await loadTutoringEvidenceContext({
    workspaceId,
    userId,
    conceptId: session.conceptId,
    teachBackSessionId: session.teachBackSessionId
  });

  const decision = decideNextMove({
    session,
    previousTurns: newTurns,
    availableSourceChunkIds: context.sourceChunkIds,
  });
  
  if (!context.hasSourceEvidence) {
     decision.question = 'I don\'t have enough source material available to guide you on this concept. Could you provide more notes or documents for us to work from?';
  }

  const question = context.hasSourceEvidence ? await generateTutorMessage({
    session,
    decision,
    previousTurns: newTurns,
    sourceChunksText: context.sourceChunksText
  }) : decision.question;

  const nextStatus = decision.shouldCompleteSession ? (decision.nextMove === 'summarize_progress' ? 'needs_review' : 'completed') : 'active';
  const newTurnCount = session.currentTurnCount + 1;

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

  if (uError || !updatedSessionData) throw new AppError('Session not found or unauthorized', 404, 'NOT_FOUND');

  const { data: tutorTurnData, error: ttError } = await supabase
    .from('tutoring_turns')
    .insert({
      tutoring_session_id: sessionId,
      workspace_id: workspaceId,
      user_id: userId,
      role: 'tutor',
      turn_type: decision.nextMove === 'ask_correction' ? 'correction_prompt' : decision.nextMove === 'provide_small_hint' ? 'hint' : decision.nextMove === 'summarize_progress' ? 'summary' : 'socratic_question',
      content: question,
      source_chunk_ids: context.sourceChunkIds,
      gap_finding_ids: context.gapFindingIds,
      mastery_signal_ids: context.masterySignalIds,
      tutor_move: decision.nextMove,
    })
    .select()
    .single();

  if (ttError) throw new AppError('DB_ERROR', 500, ttError.message);

  await recordOperationalEvent({
    workspaceId,
    userId,
    eventType: 'tutoring_turn_submitted',
    safeMessage: 'Student responded to tutoring',
    entityType: 'tutoring_session',
    entityId: sessionId,
    metadata: { 
      turnCount: newTurnCount, 
      tutorMove: decision.nextMove,
      willComplete: decision.shouldCompleteSession 
    }
  });

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

  await recordOperationalEvent({
    workspaceId,
    userId,
    eventType: 'tutoring_completed',
    safeMessage: 'Tutoring session completed successfully',
    entityType: 'tutoring_session',
    entityId: sessionId
  });

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

  await recordOperationalEvent({
    workspaceId,
    userId,
    eventType: 'tutoring_abandoned',
    safeMessage: 'Tutoring session was abandoned',
    entityType: 'tutoring_session',
    entityId: sessionId
  });

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
