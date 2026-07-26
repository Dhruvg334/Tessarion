import Link from 'next/link';
import type { TutoringSession } from '@/lib/tutoring/types';

function statusLabel(status: TutoringSession['status']) {
  switch (status) {
    case 'active': return 'In progress';
    case 'completed': return 'Completed';
    case 'needs_review': return 'Needs another teach-back';
    case 'abandoned': return 'Ended early';
    case 'blocked': return 'Blocked';
    default: return status;
  }
}

function focusLabel(focus: TutoringSession['focusType']) {
  return focus.replaceAll('_', ' ');
}

export function TutoringSessionList({ workspaceId, sessions }: { workspaceId: string; sessions: TutoringSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="tutor-empty-state">
        <p className="eyebrow">No sessions yet</p>
        <h3>Guided tutoring begins after diagnosis</h3>
        <p>Complete a teach-back or open a high-priority review. Tessarion will use the detected gap to start a bounded Socratic session.</p>
        <div className="tutor-empty-actions">
          <Link href={`/workspace/${workspaceId}?panel=graph`} className="btn">Choose a concept</Link>
          <Link href={`/workspace/${workspaceId}?panel=review`} className="btn btn-secondary">Open reviews</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-session-list">
      {sessions.map((session) => (
        <article className="tutor-session-card" key={session.id}>
          <div className="tutor-session-card-head">
            <div>
              <p className="eyebrow">{focusLabel(session.focusType)}</p>
              <h3>{session.focusSummary}</h3>
            </div>
            <span className={`tutor-session-status is-${session.status}`}>{statusLabel(session.status)}</span>
          </div>
          <div className="tutor-session-meta">
            <span>{session.currentTurnCount} of {session.maxTurns} turns used</span>
            <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
          </div>
          <p className="tutor-session-note">
            {session.status === 'active'
              ? 'Continue from the last question. The session remains focused on one diagnosed gap.'
              : 'Review the exchange, then return to teach-back to produce new mastery evidence.'}
          </p>
          <Link href={`/workspace/${workspaceId}?panel=tutor&tutoring=${session.id}`} className="btn btn-secondary">
            {session.status === 'active' ? 'Continue session' : 'Review session'}
          </Link>
        </article>
      ))}
    </div>
  );
}
