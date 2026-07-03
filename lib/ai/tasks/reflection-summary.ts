import { GapFindingOutput, TeachBackSummary, SocraticQuestionOutput } from '../types';

export interface FeedbackSummaryOptions {
  studentExplanation: string;
  conceptName: string;
  gaps: GapFindingOutput[];
  followUpQuestion: SocraticQuestionOutput | null;
}

export async function generateFeedbackSummary(options: FeedbackSummaryOptions): Promise<TeachBackSummary> {
  const { gaps, conceptName, followUpQuestion } = options;

  const missingConcepts = gaps.filter(g => g.gapType === 'missing_concept');
  const unsupportedClaims = gaps.filter(g => g.gapType === 'unsupported_claim');
  
  const actualGaps = gaps.filter(g => g.gapType !== 'unsupported_claim');

  // Grounded positive feedback: if the core concept wasn't flagged as missing, they covered it well.
  const coveredWell: string[] = [];
  if (missingConcepts.length === 0) {
    coveredWell.push(`You successfully identified and explained the core concept of ${conceptName}.`);
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
