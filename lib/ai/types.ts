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
