export interface ExtractedConcept {
  name: string;
  definition: string;
  sourceChunkIds: string[];
  confidenceScore: number;
  importanceScore: number;
  aliases: string[];
  evidenceQuotes: string[];
  suggestedBloomLevel: number;
  extractionMethod: 'local_deterministic' | 'llm';
}

export interface ExtractedRelationship {
  sourceNodeName: string;
  targetNodeName: string;
  relationshipType: 'prerequisite' | 'related' | 'contrasts' | 'causal';
  description: string;
  sourceChunkIds: string[];
  confidenceScore: number;
  evidence: string;
  extractionMethod: 'local_deterministic' | 'llm';
}

export interface AgentRunSummary {
  proposedConcepts: number;
  acceptedConcepts: number;
  rejectedConcepts: number;
  lowConfidenceConcepts: number;
  proposedRelationships: number;
  acceptedRelationships: number;
  rejectedRelationships: number;
  lowConfidenceRelationships: number;
  groundingRate: number;
  warnings: string[];
}

export interface ConceptExtractionResult {
  runId: string;
  status: string;
  providerUsed: string;
  fallbackUsed: boolean;
  summary: AgentRunSummary;
  warnings: string[];
}

export type GapType = 'missing_concept' | 'misconception' | 'weak_connection' | 'shallow_explanation' | 'missing_prerequisite' | 'unsupported_claim';

export interface GapFindingOutput {
  gapType: GapType;
  description: string;
  severity: 'minor' | 'moderate' | 'significant';
  sourceEvidence: string;
  sourceChunkIds: string[];
  relatedConceptId?: string;
  confidenceScore: number;
  groundingStatus: 'verified' | 'unverified' | 'failed';
  extractionMethod: 'local_deterministic' | 'llm';
  claimText?: string;
  reason?: string;
  studentExplanationSpan?: string;
}

export interface SocraticQuestionOutput {
  questionText: string;
  targetGapId?: string;
  targetGapType?: GapType;
  bloomsLevel: number;
  reasoning: string;
  sourceChunkIds: string[];
  confidenceScore: number;
  generationMethod: 'local_deterministic' | 'llm';
}

export interface TeachBackSummary {
  coveredWell: string[];
  gaps: GapFindingOutput[];
  unsupportedClaims: GapFindingOutput[];
  followUpQuestion: SocraticQuestionOutput | null;
  evidenceUsed: string[];
}

export interface TeachBackAgentResult {
  runId: string;
  status: 'completed' | 'failed' | 'insufficient_evidence';
  providerUsed: string;
  fallbackUsed: boolean;
  summary: TeachBackSummary | null;
  reviewStatus: 'reliable' | 'needs_review' | 'insufficient_evidence';
  warnings: string[];
}
