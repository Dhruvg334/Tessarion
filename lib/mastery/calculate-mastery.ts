import { ConceptMastery, MasteryState, MasterySignalData, CoveredMasteryEvidence, MasteryGapInput } from './types';

export interface MasteryInput {
  conceptId: string;
  workspaceId: string;
  userId: string;
  sourceSessionId: string;
  sourceExplanationId: string | null;
  coveredWell: CoveredMasteryEvidence[];
  gapFindings: MasteryGapInput[];
  existingMastery?: ConceptMastery | null;
}

export interface MasteryCalculationResult {
  newMastery: ConceptMastery;
  newSignals: MasterySignalData[];
}

/**
 * Determines whether a covered-well evidence item is source-grounded.
 * Ungrounded positive coverage is ignored for mastery improvement.
 */
function isGrounded(evidence: CoveredMasteryEvidence): boolean {
  return (
    (evidence.sourceChunkIds && evidence.sourceChunkIds.length > 0) ||
    (typeof evidence.relatedConceptId === 'string' && evidence.relatedConceptId.length > 0)
  );
}

export function calculateMastery(input: MasteryInput): MasteryCalculationResult {
  const { conceptId, workspaceId, userId, sourceSessionId, sourceExplanationId, coveredWell, gapFindings, existingMastery } = input;

  const newSignals: MasterySignalData[] = [];

  // Only grounded positive coverage counts
  const groundedCoverage = coveredWell.filter(isGrounded);

  // Track grounded covered parts as positive signals
  groundedCoverage.forEach((covered) => {
    newSignals.push({
      conceptId,
      workspaceId,
      userId,
      sourceSessionId,
      sourceExplanationId,
      signalType: 'positive_coverage',
      strength: Math.min(covered.confidenceScore || 0.8, 1.0),
      confidenceScore: covered.confidenceScore || 0.9,
      evidence: covered.description,
      sourceChunkIds: covered.sourceChunkIds || [],
      gapFindingIds: [],
    });
  });

  // Track gaps as negative/corrective signals
  gapFindings.forEach(gap => {
    let strength = 0.5;
    if (gap.severity === 'minor') strength = 0.3;
    if (gap.severity === 'significant') strength = 0.9;

    newSignals.push({
      conceptId,
      workspaceId,
      userId,
      sourceSessionId,
      sourceExplanationId,
      signalType: gap.gap_type || 'unknown_gap',
      strength,
      confidenceScore: 0.9,
      evidence: gap.description,
      sourceChunkIds: gap.source_chunk_ids || [],
      gapFindingIds: gap.id ? [gap.id] : [],
    });
  });

  let newState: MasteryState = 'unassessed';
  let recommendationLabel = 'Try explaining this concept.';
  let explanation = 'No evidence collected yet.';

  const attemptsCount = (existingMastery?.attemptsCount || 0) + 1;
  const evidenceCount = (existingMastery?.evidenceCount || 0) + groundedCoverage.length + gapFindings.length;

  const hasMisconception = gapFindings.some(g => g.gap_type === 'misconception' || g.gap_type === 'unsupported_claim');
  const hasSevereMisconception = gapFindings.some(g => (g.gap_type === 'misconception' || g.gap_type === 'unsupported_claim') && g.severity === 'significant');
  const hasPrereqGap = gapFindings.some(g => g.gap_type === 'missing_prerequisite');
  const missingConceptsCount = gapFindings.filter(g => g.gap_type === 'missing_concept').length;
  const hasShallow = gapFindings.some(g => g.gap_type === 'shallow_explanation');

  if (evidenceCount === 0) {
    newState = 'unassessed';
    recommendationLabel = 'Start learning';
    explanation = 'No evidence found.';
  } else if (evidenceCount < 2 && attemptsCount < 2) {
    newState = 'insufficient_evidence';
    recommendationLabel = 'Provide more detail';
    explanation = 'Explanation was too brief to fully assess understanding.';
  } else if (hasSevereMisconception) {
    newState = 'misconception';
    recommendationLabel = 'Review and correct';
    explanation = 'A critical misunderstanding was detected.';
  } else if (hasMisconception || hasPrereqGap) {
    newState = 'needs_review';
    recommendationLabel = 'Review core ideas';
    explanation = hasPrereqGap ? 'Missing foundational prerequisites.' : 'Some misconceptions present.';
  } else if (missingConceptsCount > 1 || (missingConceptsCount > 0 && groundedCoverage.length === 0)) {
    newState = 'emerging';
    recommendationLabel = 'Keep expanding';
    explanation = 'Missing multiple key concepts. Understanding is still forming.';
  } else if (missingConceptsCount === 1 || hasShallow) {
    newState = 'partial';
    recommendationLabel = 'Add more depth';
    explanation = 'Good start, but missing some depth or specific details.';
  } else if (groundedCoverage.length > 0) {
    newState = 'understood';
    recommendationLabel = 'Ready to advance';
    explanation = 'Clear and accurate understanding demonstrated.';
  } else if (groundedCoverage.length === 0 && gapFindings.length === 0 && existingMastery) {
    // If there's no new grounded evidence and no new gaps, retain the existing state
    newState = existingMastery.state;
    recommendationLabel = existingMastery.recommendationLabel;
    explanation = existingMastery.explanation;
  } else {
    newState = 'insufficient_evidence';
    recommendationLabel = 'Elaborate further';
    explanation = 'Could not confidently assess mastery state.';
  }

  // Override logic: recent severe misconception overrides older understood
  if (newState === 'understood' && existingMastery?.state === 'misconception' && groundedCoverage.length === 0) {
    newState = 'misconception';
    recommendationLabel = existingMastery.recommendationLabel;
    explanation = existingMastery.explanation;
  }

  const newMastery: ConceptMastery = {
    conceptId,
    workspaceId,
    userId,
    state: newState,
    score: getInternalScore(newState),
    confidenceScore: evidenceCount > 2 ? 0.9 : 0.6,
    evidenceCount,
    attemptsCount,
    lastAssessedAt: new Date().toISOString(),
    strongestGaps: gapFindings.filter(g => g.severity === 'significant').map(g => g.description),
    coveredSignals: groundedCoverage.map(c => c.description),
    recommendationLabel,
    explanation,
  };

  return { newMastery, newSignals };
}

function getInternalScore(state: MasteryState): number {
  switch (state) {
    case 'understood': return 90;
    case 'partial': return 60;
    case 'weak_connection': return 50;
    case 'emerging': return 40;
    case 'needs_review': return 30;
    case 'misconception': return 20;
    case 'insufficient_evidence': return 0;
    case 'unassessed': return 0;
    default: return 0;
  }
}
