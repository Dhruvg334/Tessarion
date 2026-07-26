'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LoadingState } from '@/components/shell/loading-state';
import { EmptyState } from '@/components/shell/empty-state';
import { StartTutoringButton } from '@/components/tutoring/start-tutoring-button';
import { mapReviewReasonToTutoringFocus } from '@/lib/tutoring/types';

interface ReviewQueueProps {
  workspaceId?: string;
}

interface ReviewQueueItem {
  id: string;
  workspace_id: string;
  concept_node_id: string;
  conceptName: string;
  workspaceName?: string;
  computedStatus: string;
  reason: string;
  reason_type: string;
  priority: string;
}

type ReviewFilter = 'all' | 'urgent' | 'guided';

function priorityRank(priority: string) {
  if (priority === 'critical') return 0;
  if (priority === 'high') return 1;
  if (priority === 'medium') return 2;
  return 3;
}

function priorityLabel(priority: string) {
  return priority === 'critical' ? 'Critical' : priority.charAt(0).toUpperCase() + priority.slice(1);
}

async function readError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    return payload.error || payload.message || fallback;
  } catch {
    return fallback;
  }
}

export function ReviewQueue({ workspaceId }: ReviewQueueProps) {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReviewFilter>('all');

  const fetchQueue = useCallback(async () => {
    setError(null);
    try {
      const url = workspaceId ? `/api/workspaces/${workspaceId}/review` : '/api/review';
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(await readError(response, 'Could not load the review queue.'));
      const payload = (await response.json()) as { data?: ReviewQueueItem[] };
      setQueue(payload.data ?? []);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Could not load the review queue.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void fetchQueue();
  }, [fetchQueue]);

  const visibleItems = useMemo(() => {
    return [...queue]
      .filter((item) => {
        if (filter === 'urgent') return item.priority === 'critical' || item.priority === 'high';
        if (filter === 'guided') return item.priority === 'critical' || item.priority === 'high';
        return true;
      })
      .sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority));
  }, [filter, queue]);

  const urgentCount = queue.filter((item) => item.priority === 'critical' || item.priority === 'high').length;

  const handleAction = async (item: ReviewQueueItem, action: 'complete' | 'skip') => {
    if (activeReviewId) return;
    setActionError(null);
    setActiveReviewId(item.id);
    try {
      const targetWorkspaceId = workspaceId || item.workspace_id;
      const response = await fetch(`/api/workspaces/${targetWorkspaceId}/review/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error(await readError(response, `Could not ${action} this review.`));
      setQueue((current) => current.filter((review) => review.id !== item.id));
    } catch (caught: unknown) {
      setActionError(caught instanceof Error ? caught.message : `Could not ${action} this review.`);
    } finally {
      setActiveReviewId(null);
    }
  };

  if (loading) return <LoadingState type="panel" message="Loading review queue…" />;

  if (error) {
    return (
      <div className="review-error-state" role="alert">
        <div><p className="eyebrow">Queue unavailable</p><h3>Reviews could not be loaded</h3><p>{error}</p></div>
        <button type="button" className="btn btn-secondary" onClick={() => { setLoading(true); void fetchQueue(); }}>Try again</button>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <EmptyState
        title="No reviews are waiting"
        description="Review recommendations appear after teach-back creates evidence about a misconception, missing concept, weak connection, or reinforcement need."
        action={workspaceId ? <Link href={`/workspace/${workspaceId}?panel=graph`} className="btn">Choose a concept</Link> : undefined}
      />
    );
  }

  return (
    <div className="review-workspace">
      <header className="review-workspace-header">
        <div>
          <p className="eyebrow">Evidence-based review</p>
          <h2>Repair the concepts that currently block progress</h2>
          <p>Items are ordered by severity. Completing a card records the review action; mastery changes only after new learning evidence.</p>
        </div>
        <div className="review-summary-strip" aria-label="Review summary">
          <div><strong>{queue.length}</strong><span>waiting</span></div>
          <div><strong>{urgentCount}</strong><span>urgent</span></div>
          <div><strong>{queue.length - urgentCount}</strong><span>reinforcement</span></div>
        </div>
      </header>

      <div className="review-toolbar">
        <div className="review-filter-group" role="group" aria-label="Filter reviews">
          {([
            ['all', 'All'],
            ['urgent', 'Urgent'],
            ['guided', 'Tutor-ready'],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={filter === value ? 'is-active' : undefined} aria-pressed={filter === value}>{label}</button>
          ))}
        </div>
        <span>{visibleItems.length} shown</span>
      </div>

      {actionError ? <div className="review-inline-error" role="alert"><strong>Review action failed</strong><span>{actionError}</span></div> : null}

      <div className="review-card-list">
        {visibleItems.map((item, index) => {
          const tutorReady = item.priority === 'critical' || item.priority === 'high';
          const busy = activeReviewId === item.id;
          return (
            <article key={item.id} className={`review-card is-${item.priority}`}>
              <div className="review-card-index">{String(index + 1).padStart(2, '0')}</div>
              <div className="review-card-body">
                <div className="review-card-head">
                  <div>
                    <p className="eyebrow">{item.reason_type.replaceAll('_', ' ')}</p>
                    <h3>{item.conceptName}</h3>
                    {!workspaceId && item.workspaceName ? <span>Notebook: {item.workspaceName}</span> : null}
                  </div>
                  <div className="review-card-badges"><span>{priorityLabel(item.priority)}</span><span>{item.computedStatus.replaceAll('_', ' ')}</span></div>
                </div>
                <div className="review-reason-block"><strong>Why it is here</strong><p>{item.reason}</p></div>
                <div className="review-route-note">
                  <strong>{tutorReady ? 'Recommended route' : 'Recommended action'}</strong>
                  <span>{tutorReady ? 'Use guided tutoring to repair the diagnosed gap, then teach the concept back again.' : 'Review the evidence, then produce a stronger teach-back explanation.'}</span>
                </div>
                <div className="review-card-actions">
                  {tutorReady ? (
                    <StartTutoringButton
                      workspaceId={item.workspace_id}
                      conceptId={item.concept_node_id}
                      reviewScheduleId={item.id}
                      focusType={mapReviewReasonToTutoringFocus(item.reason_type)}
                      focusSummary={item.reason}
                    />
                  ) : workspaceId ? <Link href={`/workspace/${workspaceId}?panel=graph`} className="btn">Open concept</Link> : null}
                  <button type="button" className="btn btn-secondary" onClick={() => void handleAction(item, 'complete')} disabled={Boolean(activeReviewId)}>{busy ? 'Saving…' : 'Mark reviewed'}</button>
                  <button type="button" className="review-skip-action" onClick={() => void handleAction(item, 'skip')} disabled={Boolean(activeReviewId)}>Skip for now</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
