import { GapFindingOutput, SocraticQuestionOutput, GapType } from '../types';

export interface SocraticQuestionOptions {
  gaps: GapFindingOutput[];
  studentExplanation: string;
  provider: 'local' | 'gemini';
}

const gapPriority: Record<GapType, number> = {
  unsupported_claim: 6,
  misconception: 5,
  missing_prerequisite: 4,
  missing_concept: 3,
  weak_connection: 2,
  shallow_explanation: 1
};

const severityScore = {
  significant: 3,
  moderate: 2,
  minor: 1
};

export async function generateSocraticQuestions(options: SocraticQuestionOptions): Promise<SocraticQuestionOutput[]> {
  const { gaps, provider } = options;
  if (!gaps || gaps.length === 0) return [];

  // Sort gaps by priority -> severity -> confidence
  const sortedGaps = [...gaps].sort((a, b) => {
    const prioDiff = (gapPriority[b.gapType] || 0) - (gapPriority[a.gapType] || 0);
    if (prioDiff !== 0) return prioDiff;
    
    const sevDiff = (severityScore[b.severity] || 0) - (severityScore[a.severity] || 0);
    if (sevDiff !== 0) return sevDiff;

    return (b.confidenceScore || 0) - (a.confidenceScore || 0);
  });

  const targetGap = sortedGaps[0];

  // Local deterministic fallback
  const getLocalQuestion = (gap: GapFindingOutput): string => {
    switch (gap.gapType) {
      case 'unsupported_claim':
        return `You mentioned "${gap.claimText}". What evidence from the text supports that?`;
      case 'misconception':
        return `There seems to be a slight misunderstanding. How would you rethink your explanation considering the text?`;
      case 'missing_prerequisite':
        return `How does this concept connect back to earlier ideas you learned?`;
      case 'missing_concept':
        return `You missed mentioning a core concept. How does the exact terminology fit into your explanation?`;
      case 'shallow_explanation':
        return `Can you elaborate more on the specific details or mechanisms?`;
      default:
        return `Can you explain that in a bit more detail?`;
    }
  };

  const output: SocraticQuestionOutput = {
    questionText: getLocalQuestion(targetGap),
    targetGapType: targetGap.gapType,
    bloomsLevel: 3,
    reasoning: `Targeting the highest priority gap: ${targetGap.gapType}`,
    sourceChunkIds: targetGap.sourceChunkIds,
    confidenceScore: 0.8,
    generationMethod: 'local_deterministic'
  };

  return [output];
}
