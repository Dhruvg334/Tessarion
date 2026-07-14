export type TutoringTurnRole = 'student' | 'tutor' | 'system';

export type TutoringTurnType = 
  | 'student_response'
  | 'socratic_question'
  | 'hint'
  | 'correction_prompt'
  | 'source_prompt'
  | 'reflection_prompt'
  | 'summary'
  | 'completion_check';

export type TutoringSessionStatus = 
  | 'active'
  | 'completed'
  | 'abandoned'
  | 'blocked'
  | 'needs_review';

export type TutoringFocusType = 
  | 'misconception'
  | 'missing_concept'
  | 'weak_connection'
  | 'shallow_explanation'
  | 'unsupported_claim'
  | 'prerequisite_gap'
  | 'review_reinforcement';

export type TutoringMove = 
  | 'ask_clarifying_question'
  | 'ask_contrast_question'
  | 'ask_evidence_question'
  | 'ask_example_question'
  | 'ask_prerequisite_question'
  | 'provide_small_hint'
  | 'ask_correction'
  | 'request_teach_back_again'
  | 'summarize_progress'
  | 'complete_session';

export interface TutoringSession {
  id: string;
  workspaceId: string;
  userId: string;
  conceptId: string;
  teachBackSessionId?: string | null;
  reviewScheduleId?: string | null;
  focusType: TutoringFocusType;
  focusSummary: string;
  status: TutoringSessionStatus;
  maxTurns: number;
  currentTurnCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface TutoringTurn {
  id: string;
  tutoringSessionId: string;
  workspaceId: string;
  userId: string;
  role: TutoringTurnRole;
  turnType: TutoringTurnType;
  content: string;
  sourceChunkIds: string[];
  gapFindingIds: string[];
  masterySignalIds: string[];
  tutorMove?: TutoringMove | null;
  createdAt: string;
}

export interface TutoringDecision {
  nextMove: TutoringMove;
  question: string;
  hint?: string | null;
  sourceChunkIds: string[];
  gapFindingIds: string[];
  shouldUpdateMastery: boolean;
  shouldCompleteSession: boolean;
  reason: string;
  confidenceScore: number;
}

export function mapReviewReasonToTutoringFocus(reasonType: string): TutoringFocusType {
  switch (reasonType) {
    case 'misconception': return 'misconception';
    case 'needs_review': return 'missing_concept'; // Default to missing_concept, can be overridden by signals
    case 'weak_connection': return 'weak_connection';
    case 'unsupported_claim': return 'unsupported_claim';
    case 'missing_prerequisite': return 'prerequisite_gap';
    case 'scheduled_reinforcement': return 'review_reinforcement';
    case 'insufficient_evidence': return 'shallow_explanation';
    default: return 'shallow_explanation';
  }
}
