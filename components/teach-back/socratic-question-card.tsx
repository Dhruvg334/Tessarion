'use client';
import { SocraticQuestionOutput } from '@/lib/ai/types';

export function SocraticQuestionCard({ question }: { question: SocraticQuestionOutput }) {
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--line-strong)',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <h3 className="handwritten" style={{ margin: '0 0 0.75rem 0', color: 'var(--ink)', fontSize: '1.5rem' }}>Follow-up Question</h3>
      <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ink)', lineHeight: 1.5 }}>
        {question.questionText}
      </p>
    </div>
  );
}
