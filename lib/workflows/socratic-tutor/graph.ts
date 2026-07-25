import { decideNextMove } from '@/lib/tutoring/decide-next-move';
import type { TutoringSession, TutoringTurn } from '@/lib/tutoring/types';
import { TutorWorkflowInputSchema, type TutorWorkflowInput, type TutorWorkflowResult } from './types';

export async function runSocraticTutor(input: TutorWorkflowInput): Promise<TutorWorkflowResult> {
  const parsed = TutorWorkflowInputSchema.parse(input);
  const trace: TutorWorkflowResult['stepTrace'] = [];
  if (parsed.previousTurns.length > 0 && parsed.learnerResponse === null) {
    return { status: 'waiting_for_learner', nextMove: null, tutorMessage: null, shouldComplete: false, shouldReturnToTeachBack: false, checkpoint: { sessionId: parsed.sessionId, turnCount: parsed.previousTurns.length, lastMove: parsed.previousTurns.at(-1)?.tutorMove ?? null }, errorCode: null, stepTrace: [{ node: 'wait_for_learner', outcome: 'interrupt' }] };
  }
  const now = new Date().toISOString();
  const session: TutoringSession = { id: parsed.sessionId, workspaceId: parsed.workspaceId, userId: parsed.userId, conceptId: parsed.conceptId, focusType: parsed.focusType, focusSummary: parsed.focusSummary, status: 'active', maxTurns: parsed.maxTurns, currentTurnCount: parsed.previousTurns.length, createdAt: now, updatedAt: now };
  const turns: TutoringTurn[] = [...parsed.previousTurns];
  if (parsed.learnerResponse?.trim()) turns.push({ id: `${parsed.sessionId}-student-${turns.length + 1}`, tutoringSessionId: parsed.sessionId, workspaceId: parsed.workspaceId, userId: parsed.userId, role: 'student', turnType: 'student_response', content: parsed.learnerResponse.trim(), sourceChunkIds: [], gapFindingIds: [], masterySignalIds: [], createdAt: now });
  trace.push({ node: 'load_memory', outcome: 'success' }, { node: 'select_pedagogical_move', outcome: 'success' });
  const decision = decideNextMove({ session: { ...session, currentTurnCount: turns.length }, previousTurns: turns, availableSourceChunkIds: parsed.sourceChunkIds });
  const questionMarks = (decision.question.match(/\?/g) ?? []).length;
  if (questionMarks > 1) return { status: 'failed', nextMove: null, tutorMessage: null, shouldComplete: false, shouldReturnToTeachBack: false, checkpoint: { sessionId: parsed.sessionId, turnCount: turns.length, lastMove: null }, errorCode: 'MULTIPLE_QUESTIONS_REJECTED', stepTrace: [...trace, { node: 'validate_tutor_message', outcome: 'failure' }] };
  trace.push({ node: 'validate_tutor_message', outcome: 'success' });
  return { status: decision.shouldCompleteSession ? 'completed' : 'waiting_for_learner', nextMove: decision.nextMove, tutorMessage: decision.question, shouldComplete: decision.shouldCompleteSession, shouldReturnToTeachBack: decision.shouldCompleteSession, checkpoint: { sessionId: parsed.sessionId, turnCount: turns.length + 1, lastMove: decision.nextMove }, errorCode: null, stepTrace: [...trace, { node: decision.shouldCompleteSession ? 'complete' : 'wait_for_learner', outcome: decision.shouldCompleteSession ? 'success' : 'interrupt' }] };
}
