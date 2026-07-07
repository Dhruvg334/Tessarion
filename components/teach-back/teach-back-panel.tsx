'use client';

import { useState } from 'react';
import { GapFeedback } from './gap-feedback';
import { SocraticQuestionCard } from './socratic-question-card';
import { TeachBackAgentResult } from '@/lib/ai/types';
import { LoadingState } from '@/components/shell/loading-state';

interface TeachBackPanelProps {
  workspaceId: string;
  conceptId: string;
  conceptName: string;
  conceptDefinition?: string;
  onClose: () => void;
}

export function TeachBackPanel({ workspaceId, conceptId, conceptName, conceptDefinition, onClose }: TeachBackPanelProps) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TeachBackAgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!explanation.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      // 1. Start Session
      const startRes = await fetch(`/api/workspaces/${workspaceId}/concepts/${conceptId}/teach-back`, {
        method: 'POST'
      });
      
      if (!startRes.ok) throw new Error('Failed to start session');
      const session = await startRes.json();

      // 2. Submit Explanation
      const submitRes = await fetch(`/api/workspaces/${workspaceId}/teach-back/${session.id}/explanations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: explanation, provider: 'local' }) // default to local
      });

      if (!submitRes.ok) throw new Error('Failed to submit explanation');
      const data = await submitRes.json();
      setResult(data);

    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred during teach-back.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '100%',
      maxWidth: '450px',
      height: '100vh',
      backgroundColor: 'var(--paper)',
      boxShadow: 'var(--shadow-card)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--line-strong)',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'serif', color: 'var(--ink)' }}>Teach Back: {conceptName}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--ink-soft)' }}>×</button>
      </div>

      <div style={{ padding: '1.5rem', flex: 1 }}>
        {!result ? (
          <>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Explain <strong>{conceptName}</strong> in your own words. We&apos;ll check your understanding against the source material.
            </p>
            {conceptDefinition && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--cream)', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--ink)' }}>
                <strong>Hint:</strong> {conceptDefinition}
              </div>
            )}
            <textarea
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid var(--line-strong)',
                fontSize: '1rem',
                lineHeight: 1.5,
                backgroundColor: 'var(--white)',
                resize: 'vertical',
                marginBottom: '1rem'
              }}
              placeholder="Type your explanation here..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              disabled={loading}
            />
            {error && <div style={{ color: 'var(--ink)', fontWeight: 500, marginBottom: '1rem', borderLeft: '4px solid var(--ink)', paddingLeft: '0.75rem' }}>Error: {error}</div>}
            
            {loading ? (
              <div style={{ padding: '2rem 0' }}>
                <LoadingState type="panel" message="Checking source evidence..." />
              </div>
            ) : (
              <button 
                className="btn" 
                onClick={handleSubmit} 
                disabled={!explanation.trim()}
                style={{ width: '100%' }}
              >
                Submit Explanation
              </button>
            )}
          </>
        ) : (
          <div>
            {result.status === 'insufficient_evidence' ? (
              <div style={{ color: 'var(--ink)', backgroundColor: 'var(--paper)', border: '1px solid var(--line-strong)', padding: '1rem', borderRadius: '4px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Insufficient Evidence</h3>
                <p style={{ margin: 0 }}>There isn&apos;t enough source text associated with this concept to provide grounded feedback.</p>
              </div>
            ) : result.summary ? (
              <>
                {result.summary.masteryState && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--white)', border: '1px solid var(--line-strong)', borderRadius: '4px', textAlign: 'center' }}>
                    <div className="eyebrow" style={{ marginBottom: '0.25rem' }}>Updated Learning State</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', textTransform: 'capitalize' }}>
                      {result.summary.masteryState.replace('_', ' ')}
                    </div>
                  </div>
                )}

                {result.summary.coveredWell.length > 0 && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--paper)', border: '1px solid var(--line)', borderLeft: '4px solid var(--ink)', borderRadius: '4px' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ink)', fontSize: '1rem' }}>Covered Well</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--ink-soft)' }}>
                      {result.summary.coveredWell.map((cw, i) => (
                        <li key={i}>{cw.description}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.summary.unsupportedClaims.map((gap, i) => (
                  <GapFeedback key={`uc-${i}`} gap={gap} />
                ))}

                {result.summary.gaps.map((gap, i) => (
                  <GapFeedback key={`gap-${i}`} gap={gap} />
                ))}

                {result.summary.followUpQuestion && (
                  <SocraticQuestionCard question={result.summary.followUpQuestion} />
                )}

                <button 
                  className="btn btn-secondary" 
                  onClick={onClose} 
                  style={{ width: '100%', marginTop: '2rem' }}
                >
                  Return to Workspace
                </button>
              </>
            ) : (
              <div style={{ color: 'var(--ink)', borderLeft: '4px solid var(--ink)', paddingLeft: '0.75rem' }}>Failed to generate feedback summary.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
