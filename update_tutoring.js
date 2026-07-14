const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('lib/services/tutoring.ts', 'utf8');

// Insert loadTutoringEvidenceContext before startTutoringSession
const helperCode = \
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

  // 1. Fetch Concept
  const { data: concept, error: cError } = await supabase
    .from('concept_nodes')
    .select('id, name, source_chunk_ids')
    .eq('id', conceptId)
    .eq('workspace_id', workspaceId)
    .single();

  if (cError || !concept) throw new AppError('INVALID_SCOPE', 400, 'Concept not found in workspace');

  let chunkIds = new Set<string>(concept.source_chunk_ids || []);
  const gapFindingIds: string[] = [];
  const masterySignalIds: string[] = [];

  // 2. Fetch Gap Findings if teachBackSessionId provided
  if (teachBackSessionId) {
    const { data: gaps } = await supabase
      .from('gap_findings')
      .select('id, source_chunk_ids')
      .eq('session_id', teachBackSessionId);
    
    if (gaps) {
      for (const gap of gaps) {
        gapFindingIds.push(gap.id);
        if (gap.source_chunk_ids) {
          gap.source_chunk_ids.forEach((id: string) => chunkIds.add(id));
        }
      }
    }
  }

  // 3. Fetch Mastery Signals
  const { data: signals } = await supabase
    .from('mastery_signals')
    .select('id, source_chunk_ids')
    .eq('concept_node_id', conceptId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (signals) {
    for (const signal of signals) {
      masterySignalIds.push(signal.id);
      if (signal.source_chunk_ids) {
        signal.source_chunk_ids.forEach((id: string) => chunkIds.add(id));
      }
    }
  }

  const uniqueChunkIds = Array.from(chunkIds);
  let sourceChunksText = '';
  
  if (uniqueChunkIds.length > 0) {
    const { data: chunks, error: chunksError } = await supabase
      .from('source_chunks')
      .select('content')
      .in('id', uniqueChunkIds);
      
    if (chunksError) {
       console.error('Failed to fetch source chunks:', chunksError);
    } else if (chunks && chunks.length > 0) {
      sourceChunksText = chunks.map(c => c.content).join('\\n\\n');
    }
  }

  return {
    concept,
    sourceChunkIds: uniqueChunkIds,
    sourceChunksText,
    gapFindingIds,
    masterySignalIds,
    hasSourceEvidence: uniqueChunkIds.length > 0
  };
}
\;

// We will find export interface StartTutoringSessionParams and insert the helper right above it.
content = content.replace('export interface StartTutoringSessionParams', helperCode + '\\nexport interface StartTutoringSessionParams');

// Now, replace startTutoringSession completely
const startSessionReplacement = \
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

  // Load Evidence Context (also verifies concept exists)
  const context = await loadTutoringEvidenceContext({
    workspaceId,
    userId,
    conceptId,
    teachBackSessionId: params.teachBackSessionId
  });

  // Verify IDs
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
    } else if (params.teachBackSessionId) {
      // Find latest severe gap
      const { data: gap } = await supabase
        .from('gap_findings')
        .select('gap_type')
        .eq('session_id', params.teachBackSessionId)
        .order('severity', { ascending: false }) // Assuming higher severity logic or just get first
        .limit(1)
        .single();
      if (gap && gap.gap_type) {
         if (gap.gap_type === 'missing_concept') focusType = 'missing_concept';
         else if (gap.gap_type === 'misconception') focusType = 'misconception';
         else if (gap.gap_type === 'weak_connection') focusType = 'weak_connection';
         else focusType = 'shallow_explanation';
      }
    } else {
      // Check mastery signals
      const { data: signal } = await supabase
        .from('mastery_signals')
        .select('signal_type')
        .eq('concept_node_id', conceptId)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
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

  // Generate initial tutor turn
  const decision = decideNextMove({
    session,
    previousTurns: [],
    availableSourceChunkIds: context.sourceChunkIds,
  });
  
  if (!context.hasSourceEvidence) {
     decision.question = 'I don\\'t have enough source material available to guide you on this concept. Could you provide more notes or documents for us to work from?';
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

  return { session, turn: mapTurn(turnData) };
}
\;

content = content.replace(/export async function startTutoringSession[\\s\\S]*?return \\{ session, turn: mapTurn\\(turnData\\) \\};\n}/, startSessionReplacement);

// Now, replace continueTutoringSession completely
const continueSessionReplacement = \
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

  // Load Evidence Context
  const context = await loadTutoringEvidenceContext({
    workspaceId,
    userId,
    conceptId: session.conceptId,
    teachBackSessionId: session.teachBackSessionId
  });

  // Decide next move
  const decision = decideNextMove({
    session,
    previousTurns: newTurns,
    availableSourceChunkIds: context.sourceChunkIds,
  });
  
  if (!context.hasSourceEvidence) {
     decision.question = 'I don\\'t have enough source material available to guide you on this concept. Could you provide more notes or documents for us to work from?';
  }

  const question = context.hasSourceEvidence ? await generateTutorMessage({
    session,
    decision,
    previousTurns: newTurns,
    sourceChunksText: context.sourceChunksText
  }) : decision.question;

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
      source_chunk_ids: context.sourceChunkIds,
      gap_finding_ids: context.gapFindingIds,
      mastery_signal_ids: context.masterySignalIds,
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
\;

content = content.replace(/export async function continueTutoringSession[\\s\\S]*?return \\{\n    session: mapSession\\(updatedSessionData\\),\n    newTurns: \\[mapTurn\\(studentTurnData\\), mapTurn\\(tutorTurnData\\)\\],\n    decision\n  \\};\n}/, continueSessionReplacement);

fs.writeFileSync('lib/services/tutoring.ts', content, 'utf8');
console.log('Updated tutoring.ts');
