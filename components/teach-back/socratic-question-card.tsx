'use client';
import { SocraticQuestionOutput } from '@/lib/ai/types';

export function SocraticQuestionCard({ question }: { question: SocraticQuestionOutput }) {
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <h3 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 600 }}>Follow-up Question</h3>
      <p style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b', lineHeight: 1.5 }}>
        {question.questionText}
      </p>
    </div>
  );
}
