'use client';

import type { GapFindingOutput } from '@/lib/ai/types';

function label(value: string) {
  return value.replaceAll('_', ' ');
}

export function GapFeedback({ gap }: { gap: GapFindingOutput }) {
  return (
    <article className="diagnosis-gap" data-severity={gap.severity}>
      <header>
        <div>
          <span className="diagnosis-gap-type">{label(gap.gapType)}</span>
          <strong>{gap.description}</strong>
        </div>
        <span className="diagnosis-gap-severity">{gap.severity}</span>
      </header>

      {gap.claimText ? (
        <blockquote><span>Your claim</span>{gap.claimText}</blockquote>
      ) : null}

      {gap.studentExplanationSpan && gap.studentExplanationSpan !== gap.claimText ? (
        <blockquote><span>Explanation excerpt</span>{gap.studentExplanationSpan}</blockquote>
      ) : null}

      <div className="diagnosis-gap-evidence">
        <span>Evidence</span>
        <p>{gap.sourceEvidence || 'No source excerpt was returned.'}</p>
      </div>

      <dl>
        <div><dt>Grounding</dt><dd>{label(gap.groundingStatus)}</dd></div>
        <div><dt>Evidence refs</dt><dd>{gap.sourceChunkIds.length || (gap.relatedConceptId ? 1 : 0)}</dd></div>
        <div><dt>Method</dt><dd>{label(gap.extractionMethod)}</dd></div>
      </dl>
    </article>
  );
}
