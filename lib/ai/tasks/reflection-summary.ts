import { GapFindingOutput, TeachBackSummary, SocraticQuestionOutput, CoveredWellPoint } from '../types';

export interface FeedbackSummaryOptions {
  studentExplanation: string;
  conceptName: string;
  gaps: GapFindingOutput[];
  followUpQuestion: SocraticQuestionOutput | null;
  sourceChunks?: { id: string; content: string }[];
  conceptNodeId?: string;
}

export async function generateFeedbackSummary(options: FeedbackSummaryOptions): Promise<TeachBackSummary> {
  const { gaps, conceptName, followUpQuestion, sourceChunks, conceptNodeId } = options;

  const missingConcepts = gaps.filter(g => g.gapType === 'missing_concept');
  const unsupportedClaims = gaps.filter(g => g.gapType === 'unsupported_claim');
  
  const actualGaps = gaps.filter(g => g.gapType !== 'unsupported_claim');

  // Grounded positive feedback: if the core concept wasn't flagged as missing, they covered it well.
  const coveredWell: CoveredWellPoint[] = [];
  if (missingConcepts.length === 0 && sourceChunks && sourceChunks.length > 0) {
    coveredWell.push({
      description: `You successfully identified and explained the core concept of ${conceptName}.`,
      sourceChunkIds: sourceChunks.map(c => c.id),
      relatedConceptId: conceptNodeId,
      confidenceScore: 0.95, // deterministic confidence
      evidenceQuote: sourceChunks[0]?.content
    });
  } else if (missingConcepts.length === 0 && conceptNodeId) {
    // If we only have definition but no chunks, we can ground to the concept node
    coveredWell.push({
      description: `You successfully identified and explained the core concept of ${conceptName}.`,
      sourceChunkIds: [],
      relatedConceptId: conceptNodeId,
      confidenceScore: 0.9
    });
  }

  // Collect all evidence chunk IDs used across gaps
  const evidenceUsed = Array.from(new Set(
    gaps.flatMap(g => g.sourceChunkIds)
  ));

  return {
    coveredWell,
    gaps: actualGaps,
    unsupportedClaims,
    followUpQuestion,
    evidenceUsed
  };
}
