'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { TutoringSession, TutoringTurn } from '@/lib/tutoring/types';
import { TutoringTurnItem } from './tutoring-turn';

interface TutoringPanelProps {
  workspaceId: string;
  session: TutoringSession;
  initialTurns: TutoringTurn[];
}

async function readError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    return payload.error || payload.message || fallback;
  } catch {
    return fallback;
  }
}

export function TutoringPanel({ workspaceId, session: initialSession, initialTurns }: TutoringPanelProps) {
  const [session, setSession] = useState(initialSession);
  const [turns, setTurns] = useState(initialTurns);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const studentText = input.trim();
    if (!studentText || isLoading || session.status !== 'active') return;

    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/tutoring/${session.id}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentResponse: studentText }),
      });
      if (!response.ok) throw new Error(await readError(response, 'Could not save this response.'));

      const payload = (await response.json()) as { session: TutoringSession; newTurns: TutoringTurn[] };
      setSession(payload.session);
      setTurns((current) => [...current, ...payload.newTurns]);
    } catch (caught: unknown) {
      setInput(studentText);
      setError(caught instanceof Error ? caught.message : 'Could not save this response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnd = async () => {
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/tutoring/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'abandon' }),
      });
      if (!response.ok) throw new Error(await readError(response, 'Could not end this session.'));
      const payload = (await response.json()) as { status: TutoringSession['status'] };
      setSession((current) => ({ ...current, status: payload.status }));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Could not end this session.');
    } finally {
      setIsLoading(false);
    }
  };

  const ended = session.status !== 'active';
  const progress = Math.min(100, Math.round((session.currentTurnCount / Math.max(1, session.maxTurns)) * 100));

  return (
    <div className="tutor-workspace">
      <header className="tutor-workspace-header">
        <div>
          <p className="eyebrow">Socratic recovery</p>
          <h2>{session.focusSummary}</h2>
          <p>The tutor asks one bounded question at a time. It does not mark mastery; a new teach-back does.</p>
        </div>
        <div className="tutor-progress-block" aria-label={`Turn ${session.currentTurnCount} of ${session.maxTurns}`}>
          <strong>{session.currentTurnCount}/{session.maxTurns}</strong>
          <span>turns</span>
          <div><i style={{ width: `${progress}%` }} /></div>
        </div>
      </header>

      <div className="tutor-focus-strip">
        <span>Focus</span>
        <strong>{session.focusType.replaceAll('_', ' ')}</strong>
        <em>{ended ? session.status.replaceAll('_', ' ') : 'active session'}</em>
      </div>

      <div ref={scrollRef} className="tutor-thread" aria-live="polite">
        {turns.map((turn) => <TutoringTurnItem key={turn.id} turn={turn} workspaceId={workspaceId} />)}
        {isLoading ? <div className="tutor-saving-state">Saving response and choosing the next move…</div> : null}
      </div>

      {error ? <div className="tutor-error" role="alert"><strong>Session action failed</strong><span>{error}</span></div> : null}

      {!ended ? (
        <form onSubmit={handleSubmit} className="tutor-composer">
          <label htmlFor="tutor-response">Respond in your own words</label>
          <textarea
            id="tutor-response"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Explain your reasoning, compare the concepts, or answer the question directly."
            disabled={isLoading}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />
          <div className="tutor-composer-footer">
            <div><span>{input.trim().split(/\s+/).filter(Boolean).length} words</span><span>Enter to send · Shift+Enter for a new line</span></div>
            <div>
              <button type="button" className="btn btn-secondary" onClick={handleEnd} disabled={isLoading}>End session</button>
              <button type="submit" className="btn" disabled={!input.trim() || isLoading}>Send response</button>
            </div>
          </div>
        </form>
      ) : (
        <div className="tutor-completion-card">
          <div><p className="eyebrow">Session closed</p><h3>Return to evidence-producing work</h3><p>The tutor helped you repair one gap. Explain the concept again so Tessarion can record new mastery evidence.</p></div>
          <div><Link href={`/workspace/${workspaceId}?panel=graph`} className="btn">Choose concept for teach-back</Link><button type="button" className="btn btn-secondary" onClick={() => router.push(`/workspace/${workspaceId}?panel=tutor`)}>All tutor sessions</button></div>
        </div>
      )}
    </div>
  );
}
