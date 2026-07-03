import { TeachBackSummary } from '../types';
import { AppError } from '@/lib/errors/app-error';

export function validateTeachBackFeedback(summary: TeachBackSummary) {
  const errors: string[] = [];

  // Validate coveredWell
  for (const cw of summary.coveredWell) {
    if ((!cw.sourceChunkIds || cw.sourceChunkIds.length === 0) && !cw.relatedConceptId) {
      errors.push('coveredWell item must have sourceChunkIds or relatedConceptId');
    }
  }

  // Validate gaps
  for (const gap of summary.gaps) {
    if (gap.gapType !== 'unsupported_claim') {
      if (!gap.sourceChunkIds || gap.sourceChunkIds.length === 0) {
        errors.push(`Non-unsupported gap (${gap.gapType}) must have sourceChunkIds`);
      }
      if (!gap.sourceEvidence || gap.sourceEvidence.trim().length === 0) {
        errors.push(`Non-unsupported gap (${gap.gapType}) must have sourceEvidence`);
      }
    }
  }

  // Validate unsupported claims
  for (const claim of summary.unsupportedClaims) {
    if (!claim.claimText && !claim.studentExplanationSpan) {
      errors.push('unsupported_claim must have claimText or studentExplanationSpan');
    }
  }

  // Validate followUpQuestion
  if (summary.followUpQuestion) {
    const q = summary.followUpQuestion;
    const targetsGapId = q.targetGapId;
    const targetsGapType = q.targetGapType;
    
    if (!targetsGapId && !targetsGapType) {
      errors.push('followUpQuestion must target a gap by targetGapId or targetGapType');
    } else {
      const allGaps = [...summary.gaps, ...summary.unsupportedClaims];
      const foundTarget = allGaps.some(g => (targetsGapId && g.gapType === targetsGapId) /* not truly ID right now but we check */ || g.gapType === targetsGapType);
      if (!foundTarget) {
        errors.push('followUpQuestion targets a gap that does not exist in the summary');
      }
    }
  }

  if (errors.length > 0) {
    throw new AppError('VALIDATION_ERROR', 400, `Teach-back feedback validation failed: ${errors.join('; ')}`);
  }
}
