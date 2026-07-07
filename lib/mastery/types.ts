export type MasteryState =
  | 'unassessed'
  | 'insufficient_evidence'
  | 'emerging'
  | 'partial'
  | 'understood'
  | 'weak_connection'
  | 'misconception'
  | 'needs_review';

export interface ConceptMastery {
  conceptId: string;
  workspaceId: string;
  userId: string;
  state: MasteryState;
  score?: number; // Internal ordering band, not user facing
  confidenceScore: number;
  evidenceCount: number;
  attemptsCount: number;
  lastAssessedAt: string | null;
  strongestGaps: string[];
  coveredSignals: string[];
  recommendationLabel: string;
  explanation: string;
}

export interface MasterySignalData {
  conceptId: string;
  workspaceId: string;
  userId: string;
  sourceSessionId: string;
  sourceExplanationId: string | null;
  signalType: string;
  strength: number;
  confidenceScore: number;
  evidence: string;
  sourceChunkIds: string[];
  gapFindingIds: string[];
  createdAt?: string;
}
