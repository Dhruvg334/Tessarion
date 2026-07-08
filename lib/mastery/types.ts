export type MasteryState =
  | 'unassessed'
  | 'insufficient_evidence'
  | 'emerging'
  | 'partial'
  | 'understood'
  | 'weak_connection'
  | 'misconception'
  | 'needs_review';

export type GapType = 'missing_concept' | 'misconception' | 'weak_connection' | 'shallow_explanation' | 'missing_prerequisite' | 'unsupported_claim';

export type GapSeverity = 'minor' | 'moderate' | 'significant';

export interface CoveredMasteryEvidence {
  description: string;
  sourceChunkIds: string[];
  relatedConceptId?: string;
  evidenceQuote?: string;
  confidenceScore: number;
}

export interface MasteryGapInput {
  id: string;
  gap_type: GapType | null;
  severity: GapSeverity | null;
  description: string;
  source_chunk_ids: string[];
}

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

export interface MasteryUpdateTrace {
  previousMasteryState: MasteryState | null;
  newMasteryState: MasteryState;
  signalCount: number;
  evidenceCount: number;
  attemptsCount: number;
  persisted: boolean;
  warning?: string;
}
