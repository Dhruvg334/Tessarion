import { createServiceClient } from '@/lib/supabase/service';
import { detectGaps } from '../ai/tasks/gap-detection';
import { generateSocraticQuestions } from '../ai/tasks/socratic-question';
import { generateFeedbackSummary } from '../ai/tasks/reflection-summary';
import { validateTeachBackFeedback } from '../ai/tasks/feedback-validation';
import { TeachBackAgentResult } from '../ai/types';
import { persistTeachBackFeedback } from '../services/sessions';
import { createTrace, updateTraceState, completeTrace } from './tracing';
import { AppError } from '../errors/app-error';
import { getConceptMastery, persistMasteryUpdate } from '../services/mastery';
import { calculateMastery } from '../mastery/calculate-mastery';
import { CoveredMasteryEvidence, MasteryGapInput, MasteryUpdateTrace } from '../mastery/types';

export interface ExecuteTeachBackOptions {
  workspaceId: string;
  sessionId: string;
  userId: string;
  studentExplanation: string;
  explanationId: string;
  provider: 'local' | 'gemini';
}

export async function executeTeachBack(options: ExecuteTeachBackOptions): Promise<TeachBackAgentResult> {
  const { workspaceId, sessionId, userId, studentExplanation, explanationId, provider } = options;
  const trace = await createTrace(workspaceId, userId, 'teach-back-agent');
  const supabase = createServiceClient();
  let fallbackUsed = false;

  const runId = trace.runId;

  try {
    await updateTraceState(trace, 'pending');

    // 1. Load Concept and Evidence (Strict Workspace Scope Check)
    await updateTraceState(trace, 'loading_concept');
    const { data: session } = await supabase.from('teach_back_sessions')
      .select('concept_node_id')
      .eq('id', sessionId)
      .eq('workspace_id', workspaceId)
      .single();
    if (!session) throw new Error('Session not found or not in workspace');

    const { data: conceptNode } = await supabase.from('concept_nodes')
      .select('*')
      .eq('id', session.concept_node_id)
      .eq('workspace_id', workspaceId)
      .single();
    if (!conceptNode) throw new Error('Concept not found or not in workspace');

    await updateTraceState(trace, 'retrieving_evidence');
    let sourceChunks: { id: string; content: string }[] = [];
    if (conceptNode.source_chunk_ids && conceptNode.source_chunk_ids.length > 0) {
      const { data: chunks } = await supabase.from('source_chunks')
        .select('id, content')
        .in('id', conceptNode.source_chunk_ids)
        .eq('workspace_id', workspaceId);
      if (chunks) sourceChunks = chunks;
    }

    // 2. Validate Evidence
    await updateTraceState(trace, 'validating_evidence');
    if (sourceChunks.length === 0 && !conceptNode.definition) {
      await completeTrace(trace, 'failed', {}, false, 'Insufficient evidence');
      return {
        runId,
        status: 'insufficient_evidence',
        providerUsed: provider,
        fallbackUsed: false,
        summary: null,
        reviewStatus: 'insufficient_evidence',
        warnings: ['Insufficient source evidence to provide grounded feedback.']
      };
    }

    await updateTraceState(trace, 'analyzing_explanation');
    
    // 3. Detect Gaps
    await updateTraceState(trace, 'detecting_gaps');
    const gaps = await detectGaps({
      studentExplanation,
      conceptName: conceptNode.name,
      conceptDefinition: conceptNode.definition || undefined,
      sourceChunks,
      provider
    });

    if (gaps.some(g => g.extractionMethod === 'local_deterministic' && provider !== 'local')) {
      fallbackUsed = true;
    }

    // 4. Generate Follow-up
    await updateTraceState(trace, 'generating_followup');
    let followUpQuestion = null;
    if (gaps.length > 0) {
      const questions = await generateSocraticQuestions({ gaps, studentExplanation, provider });
      if (questions.length > 0) {
        followUpQuestion = questions[0];
        if (followUpQuestion.generationMethod === 'local_deterministic' && provider !== 'local') {
          fallbackUsed = true;
        }
      }
    }

    // 5. Generate Feedback Summary
    const summary = await generateFeedbackSummary({
      studentExplanation,
      conceptName: conceptNode.name,
      conceptNodeId: conceptNode.id,
      sourceChunks,
      gaps,
      followUpQuestion
    });

    // 5.5 Validate Feedback Strictness
    validateTeachBackFeedback(summary);

    // Determine reviewStatus
    let reviewStatus: 'reliable' | 'needs_review' | 'insufficient_evidence' = 'reliable';
    if (fallbackUsed) reviewStatus = 'needs_review';
    if (summary.evidenceUsed.length === 0 && gaps.length > 0) reviewStatus = 'needs_review';
    if (gaps.some(g => g.groundingStatus === 'unverified')) reviewStatus = 'needs_review';

    // 6. Persist Feedback — returns real persisted gap IDs
    await updateTraceState(trace, 'persisting_feedback');
    const { persistedGapIds } = await persistTeachBackFeedback(sessionId, summary);

    // 7. Calculate and Persist Mastery
    await updateTraceState(trace, 'updating_mastery');
    
    const existingMastery = await getConceptMastery(workspaceId, conceptNode.id, userId);

    // Map coveredWell to structured evidence (source-grounded)
    const coveredEvidence: CoveredMasteryEvidence[] = summary.coveredWell.map(cw => ({
      description: cw.description,
      sourceChunkIds: cw.sourceChunkIds || [],
      relatedConceptId: cw.relatedConceptId,
      evidenceQuote: cw.evidenceQuote,
      confidenceScore: cw.confidenceScore || 0.8,
    }));

    // Map gaps to mastery input using REAL persisted gap IDs
    const allGaps = [...summary.gaps, ...summary.unsupportedClaims];
    const masteryGaps: MasteryGapInput[] = allGaps.map((g, index) => ({
      id: persistedGapIds[index] || '',
      gap_type: g.gapType,
      severity: g.severity,
      description: g.description,
      source_chunk_ids: g.sourceChunkIds || [],
    }));

    const { newMastery, newSignals } = calculateMastery({
      conceptId: conceptNode.id,
      workspaceId,
      userId,
      sourceSessionId: sessionId,
      sourceExplanationId: explanationId,
      coveredWell: coveredEvidence,
      gapFindings: masteryGaps,
      existingMastery: existingMastery || undefined
    });

    // Build mastery trace data
    const masteryTrace: MasteryUpdateTrace = {
      previousMasteryState: existingMastery?.state || null,
      newMasteryState: newMastery.state,
      signalCount: newSignals.length,
      evidenceCount: newMastery.evidenceCount,
      attemptsCount: newMastery.attemptsCount,
      persisted: false,
    };

    // Attempt mastery persistence — handle failure gracefully
    let masteryWarning: string | undefined;
    try {
      await persistMasteryUpdate(newMastery, newSignals);
      masteryTrace.persisted = true;
    } catch {
      masteryWarning = 'Mastery update failed after feedback was persisted. Teach-back feedback is saved but mastery state was not updated.';
      masteryTrace.warning = masteryWarning;
      reviewStatus = 'needs_review';
    }

    // Attach mastery state to summary for client display
    if (masteryTrace.persisted) {
      summary.masteryState = newMastery.state;
    }

    const warnings: string[] = [];
    if (fallbackUsed) warnings.push('Local fallback used due to provider failure.');
    if (masteryWarning) warnings.push(masteryWarning);

    await completeTrace(trace, masteryTrace.persisted ? 'success' : 'partial', {
      ...summary,
      masteryTrace,
    }, fallbackUsed);

    return {
      runId,
      status: 'completed',
      providerUsed: provider,
      fallbackUsed,
      summary,
      reviewStatus,
      warnings
    };

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    await completeTrace(trace, 'failed', {}, fallbackUsed, error.message);
    throw new AppError(error.message, 500, 'AGENT_ERROR');
  }
}
