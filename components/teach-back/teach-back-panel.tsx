'use client';

import { useMemo, useState } from 'react';
import { GapFeedback } from './gap-feedback';
import { SocraticQuestionCard } from './socratic-question-card';
import type { TeachBackAgentResult } from '@/lib/ai/types';
import { SECURITY_LIMITS } from '@/lib/security/limits';
import { StartTutoringButton } from '@/components/tutoring/start-tutoring-button';

interface TeachBackPanelProps {
  workspaceId: string;
  conceptId: string;
  conceptName: string;
  conceptDefinition?: string;
  onClose: () => void;
}

type SubmissionStage = 'idle' | 'starting' | 'submitting' | 'evaluating' | 'complete';

async function readError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string; message?: string };
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
}

function humanize(value: string | undefined, fallback = 'Not recorded') {
  return value ? value.replaceAll('_', ' ') : fallback;
}

function masteryDescription(state: string | undefined) {
  switch (state) {
    case 'understood':
      return 'The explanation is grounded and covers the concept well enough to move forward.';
    case 'misconception':
      return 'A central claim conflicts with the source evidence and needs correction.';
    case 'needs_review':
      return 'The concept should return to the review queue before the next attempt.';
    case 'weak_connection':
      return 'The core idea is present, but its relationship to nearby concepts is unclear.';
    case 'partial':
      return 'The explanation contains useful understanding but leaves important details unresolved.';
    case 'emerging':
      return 'The response shows an early signal of understanding but needs more complete reasoning.';
    case 'insufficient_evidence':
      return 'Tessarion cannot make a reliable learning decision from the available evidence.';
    default:
      return 'The result is based on the evidence and gaps found in this teach-back attempt.';
  }
}

export function TeachBackPanel({ workspaceId, conceptId, conceptName, conceptDefinition, onClose }: TeachBackPanelProps) {
  const [explanation, setExplanation] = useState('');
  const [stage, setStage] = useState<SubmissionStage>('idle');
  const [result, setResult] = useState<TeachBackAgentResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remaining = SECURITY_LIMITS.MAX_TEACH_BACK_LENGTH - explanation.length;
  const wordCount = useMemo(() => explanation.trim() ? explanation.trim().split(/\s+/).length : 0, [explanation]);
  const isBusy = stage !== 'idle' && stage !== 'complete';

  const resetAttempt = () => {
    setExplanation('');
    setResult(null);
    setSessionId(null);
    setError(null);
    setStage('idle');
  };

  const handleSubmit = async () => {
    const content = explanation.trim();
    if (!content || isBusy) return;

    setError(null);
    setResult(null);
    setStage('starting');

    try {
      const startResponse = await fetch(`/api/workspaces/${workspaceId}/concepts/${conceptId}/teach-back`, {
        method: 'POST',
      });
      if (!startResponse.ok) throw new Error(await readError(startResponse, 'Could not start the teach-back session.'));

      const session = (await startResponse.json()) as { id?: string };
      if (!session.id) throw new Error('The session started without a valid identifier.');
      setSessionId(session.id);

      setStage('submitting');
      const submitResponse = await fetch(`/api/workspaces/${workspaceId}/teach-back/${session.id}/explanations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, provider: 'local' }),
      });
      if (!submitResponse.ok) throw new Error(await readError(submitResponse, 'Could not evaluate the explanation.'));

      setStage('evaluating');
      const data = (await submitResponse.json()) as TeachBackAgentResult;
      setResult(data);
      setStage('complete');
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Teach-back could not be completed.');
      setStage('idle');
    }
  };

  return (
    <div className="teachback-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="teachback-drawer" role="dialog" aria-modal="true" aria-labelledby="teachback-title">
        <header className="teachback-drawer-header">
          <div>
            <p className="eyebrow">Teach-back session</p>
            <h2 id="teachback-title">{conceptName}</h2>
          </div>
          <button type="button" className="teachback-close" onClick={onClose} aria-label="Close teach-back">×</button>
        </header>

        {!result ? (
          <div className="teachback-compose-layout">
            <main className="teachback-compose-main">
              <div className="teachback-prompt">
                <span>Prompt</span>
                <p>Explain the concept in your own words as though you were teaching it to another learner.</p>
              </div>

              <label className="teachback-label" htmlFor="teachback-explanation">Your explanation</label>
              <textarea
                id="teachback-explanation"
                className="teachback-textarea"
                placeholder="Describe what the concept means, how it works, and why it matters. Use an example where useful."
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                disabled={isBusy}
                maxLength={SECURITY_LIMITS.MAX_TEACH_BACK_LENGTH}
                autoFocus
              />
              <div className="teachback-composer-meta" aria-live="polite">
                <span>{wordCount} words</span>
                <span>{remaining.toLocaleString()} characters remaining</span>
              </div>

              {error ? (
                <div className="teachback-error" role="alert">
                  <strong>Teach-back could not be completed</strong>
                  <span>{error}</span>
                </div>
              ) : null}

              {isBusy ? (
                <div className="teachback-progress" aria-live="polite">
                  <div className="teachback-progress-track"><span /></div>
                  <strong>{stage === 'starting' ? 'Opening session' : stage === 'submitting' ? 'Saving explanation' : 'Comparing against evidence'}</strong>
                  <span>Tessarion is validating the response before updating any learning state.</span>
                </div>
              ) : null}

              <div className="teachback-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="button" className="btn" onClick={handleSubmit} disabled={!explanation.trim() || isBusy}>Evaluate explanation</button>
              </div>
            </main>

            <aside className="teachback-compose-rail">
              <section>
                <p className="eyebrow">Source anchor</p>
                <h3>Concept definition</h3>
                <p>{conceptDefinition || 'No concise definition is available. The response will be checked against linked source chunks.'}</p>
              </section>
              <section>
                <p className="eyebrow">A strong answer usually</p>
                <ul>
                  <li>states the central idea directly;</li>
                  <li>explains an important relationship or mechanism;</li>
                  <li>uses a relevant example or contrast;</li>
                  <li>avoids claims that are not supported by the source.</li>
                </ul>
              </section>
              <section className="teachback-privacy-note">
                <p className="eyebrow">Decision boundary</p>
                <p>Feedback is persisted only after evidence and output validation complete.</p>
              </section>
            </aside>
          </div>
        ) : (
          <div className="teachback-report">
            <header className="teachback-report-hero">
              <div>
                <p className="eyebrow">Diagnosis report</p>
                <h3>{result.status === 'insufficient_evidence' ? 'Evidence is insufficient' : humanize(result.summary?.masteryState, 'Attempt reviewed')}</h3>
                <p>{result.status === 'insufficient_evidence'
                  ? 'The source material linked to this concept is not sufficient for a reliable diagnosis.'
                  : masteryDescription(result.summary?.masteryState)}</p>
              </div>
              <dl>
                <div><dt>Run status</dt><dd>{humanize(result.status)}</dd></div>
                <div><dt>Review status</dt><dd>{humanize(result.reviewStatus)}</dd></div>
                <div><dt>Execution</dt><dd>{result.fallbackUsed ? 'Deterministic fallback' : humanize(result.providerUsed)}</dd></div>
              </dl>
            </header>

            {result.summary ? (
              <div className="teachback-report-grid">
                <main className="teachback-report-main">
                  <section className="teachback-report-section">
                    <div className="teachback-section-title">
                      <div><p className="eyebrow">Evidence of understanding</p><h4>What the explanation covered</h4></div>
                      <span>{result.summary.coveredWell.length}</span>
                    </div>
                    {result.summary.coveredWell.length ? (
                      <div className="teachback-positive-list">
                        {result.summary.coveredWell.map((point, index) => (
                          <article key={`${point.description}-${index}`}>
                            <span>{String(index + 1).padStart(2, '0')}</span>
                            <div><strong>{point.description}</strong>{point.evidenceQuote ? <blockquote>{point.evidenceQuote}</blockquote> : null}</div>
                          </article>
                        ))}
                      </div>
                    ) : <p className="teachback-section-empty">No grounded coverage point was recorded for this attempt.</p>}
                  </section>

                  <section className="teachback-report-section">
                    <div className="teachback-section-title">
                      <div><p className="eyebrow">Correction map</p><h4>Gaps and unsupported claims</h4></div>
                      <span>{result.summary.gaps.length + result.summary.unsupportedClaims.length}</span>
                    </div>
                    <div className="teachback-gap-list">
                      {result.summary.unsupportedClaims.map((gap, index) => <GapFeedback key={`unsupported-${index}`} gap={gap} workspaceId={workspaceId} />)}
                      {result.summary.gaps.map((gap, index) => <GapFeedback key={`gap-${index}`} gap={gap} workspaceId={workspaceId} />)}
                      {!result.summary.unsupportedClaims.length && !result.summary.gaps.length ? <p className="teachback-section-empty">No material gap was detected.</p> : null}
                    </div>
                  </section>

                  {result.summary.followUpQuestion ? <SocraticQuestionCard question={result.summary.followUpQuestion} /> : null}
                </main>

                <aside className="teachback-report-rail">
                  <section>
                    <p className="eyebrow">Evidence ledger</p>
                    <h4>References used</h4>
                    {result.summary.evidenceUsed.length ? (
                      <ol>{result.summary.evidenceUsed.map((evidence, index) => <li key={`${evidence}-${index}`}>{evidence}</li>)}</ol>
                    ) : <p>No evidence identifiers were returned.</p>}
                  </section>

                  {['misconception', 'weak_connection', 'needs_review', 'partial', 'emerging'].includes(result.summary.masteryState || '') ? (
                    <section className="teachback-tutor-handoff">
                      <p className="eyebrow">Recommended recovery</p>
                      <h4>Work through the gap</h4>
                      <p>Start a guided tutoring session focused on the first unresolved issue, then return for another teach-back.</p>
                      <StartTutoringButton
                        workspaceId={workspaceId}
                        conceptId={conceptId}
                        teachBackSessionId={sessionId || undefined}
                        focusType={result.summary.masteryState === 'misconception' ? 'misconception' : result.summary.masteryState === 'weak_connection' ? 'weak_connection' : 'shallow_explanation'}
                        focusSummary={result.summary.gaps[0]?.description || result.summary.unsupportedClaims[0]?.description || 'Guided practice needed.'}
                        className="btn"
                      />
                    </section>
                  ) : null}
                </aside>
              </div>
            ) : (
              <div className="teachback-error" role="alert"><strong>Feedback summary unavailable</strong><span>The run completed without a usable report.</span></div>
            )}

            <footer className="teachback-report-actions">
              <button type="button" className="btn btn-secondary" onClick={resetAttempt}>Try another explanation</button>
              <button type="button" className="btn" onClick={onClose}>Return to notebook</button>
            </footer>
          </div>
        )}
      </section>
    </div>
  );
}
