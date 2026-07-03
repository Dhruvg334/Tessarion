'use client';
import { GapFindingOutput } from '@/lib/ai/types';

export function GapFeedback({ gap }: { gap: GapFindingOutput }) {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'significant':
        return { color: 'var(--ink)', backgroundColor: 'var(--paper)', borderLeft: '4px solid var(--ink)' };
      case 'moderate':
        return { color: 'var(--ink)', backgroundColor: 'transparent', borderLeft: '2px solid var(--ink)' };
      default:
        return { color: 'var(--muted)', backgroundColor: 'transparent', borderLeft: '1px solid var(--line-strong)' };
    }
  };

  const style = getSeverityStyle(gap.severity);

  return (
    <div style={{
      padding: '1rem',
      marginBottom: '1rem',
      border: '1px solid var(--line)',
      borderLeft: style.borderLeft,
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
