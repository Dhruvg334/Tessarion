'use client';
import { GapFindingOutput } from '@/lib/ai/types';

export function GapFeedback({ gap }: { gap: GapFindingOutput }) {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'significant':
        return { color: '#991b1b', backgroundColor: '#fef2f2', borderColor: '#ef4444' };
      case 'moderate':
        return { color: '#9a3412', backgroundColor: '#fff7ed', borderColor: '#f97316' };
      default:
        return { color: '#075985', backgroundColor: '#f0f9ff', borderColor: '#0ea5e9' };
    }
  };

  const style = getSeverityStyle(gap.severity);

  return (
    <div style={{
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '4px',
      borderLeft: `4px solid ${style.borderColor}`,
      backgroundColor: style.backgroundColor,
      color: style.color
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {gap.gapType.replace('_', ' ')}
      </h4>
      
      {gap.gapType === 'unsupported_claim' && gap.claimText ? (
        <div style={{ marginBottom: '0.5rem' }}>
          <strong style={{ fontSize: '0.85rem' }}>Your Claim:</strong>
          <blockquote style={{ margin: '0.25rem 0 0.5rem 0', padding: '0.5rem', fontStyle: 'italic', opacity: 0.9, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px' }}>
            &quot;{gap.claimText}&quot;
          </blockquote>
          {gap.reason && <p style={{ margin: 0, fontSize: '0.9rem' }}>{gap.reason}</p>}
        </div>
      ) : (
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>{gap.description}</p>
      )}

      {gap.sourceEvidence && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', opacity: 0.9 }}>
          <strong>Evidence from Source:</strong>
          <p style={{ margin: '0.25rem 0 0 0', fontStyle: 'italic' }}>&quot;{gap.sourceEvidence}&quot;</p>
        </div>
      )}
    </div>
  );
}
