import { z } from 'zod';
import type { TutoringFocusType, TutoringMove, TutoringTurn } from '@/lib/tutoring/types';

export const TutorWorkflowInputSchema = z.object({
  runId: z.string().uuid(), traceId: z.string().uuid(), workspaceId: z.string().uuid(), userId: z.string().uuid(),
  sessionId: z.string().uuid(), conceptId: z.string().uuid(), focusType: z.custom<TutoringFocusType>(), focusSummary: z.string().min(1).max(2000),
  sourceChunkIds: z.array(z.string()).max(30), previousTurns: z.array(z.custom<TutoringTurn>()).max(40), learnerResponse: z.string().max(4000).nullable(), maxTurns: z.number().int().min(2).max(12).default(8),
});
export type TutorWorkflowInput = z.infer<typeof TutorWorkflowInputSchema>;
export interface TutorWorkflowResult {
  status: 'waiting_for_learner'|'completed'|'failed';
  nextMove: TutoringMove | null;
  tutorMessage: string | null;
  shouldComplete: boolean;
  shouldReturnToTeachBack: boolean;
  checkpoint: { sessionId: string; turnCount: number; lastMove: TutoringMove | null };
  errorCode: string | null;
  stepTrace: Array<{ node: string; outcome: 'success'|'interrupt'|'failure' }>;
}
