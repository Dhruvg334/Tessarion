'use client';

import type { SocraticQuestionOutput } from '@/lib/ai/types';

export function SocraticQuestionCard({ question }: { question: SocraticQuestionOutput }) {
  return (
    <section className="socratic-question-card">
      <div className="socratic-question-index">?</div>
      <div>
        <p className="eyebrow">Socratic follow-up</p>
        <h4>{question.questionText}</h4>
        <p>This question targets {question.targetGapType ? question.targetGapType.replaceAll('_', ' ') : 'the most important unresolved point'} without giving away the answer.</p>
      </div>
    </section>
  );
}
