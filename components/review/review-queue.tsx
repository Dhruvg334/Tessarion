'use client';

import { useState, useEffect, useCallback } from 'react';
import { LoadingState } from '@/components/shell/loading-state';
import { EmptyState } from '@/components/shell/empty-state';

interface ReviewQueueProps {
  workspaceId?: string;
}

interface ReviewQueueItem {
  id: string;
  workspace_id: string;
  conceptName: string;
  workspaceName?: string;
  computedStatus: string;
  reason: string;
  priority: string;
}

export function ReviewQueue({ workspaceId }: ReviewQueueProps) {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueue = useCallback(async () => {
    try {
      const url = workspaceId ? `/api/workspaces/${workspaceId}/review` : `/api/review`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch review queue');
      setQueue(json.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    const load = async () => {
      await fetchQueue();
    };
    load();
  }, [fetchQueue]);

  const handleAction = async (reviewId: string, action: 'complete' | 'skip', itemWorkspaceId: string) => {
    try {
      const targetWs = workspaceId || itemWorkspaceId;
      const res = await fetch(`/api/workspaces/${targetWs}/review/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `Failed to ${action} review`);
      }
      await fetchQueue();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  if (loading) return <LoadingState type="panel" message="Loading review queue..." />;
  if (error) return <div className="muted">Error: {error}</div>;

  if (queue.length === 0) {
    return (
      <EmptyState
        title="Review Queue Empty"
        description="Review recommendations appear after teach-back creates mastery evidence."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {queue.map(item => (
        <div key={item.id} className="card card-ruled" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)' }}>{item.conceptName}</h3>
              {!workspaceId && <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Notebook: {item.workspaceName}</div>}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', padding: '0.2rem 0.5rem', border: '1px solid var(--ink)', borderRadius: '2px' }}>
              {item.computedStatus}
            </span>
          </div>
          <div className="muted" style={{ fontSize: '0.9rem' }}>
            <strong>Reason:</strong> {item.reason}
          </div>
          <div className="muted" style={{ fontSize: '0.9rem' }}>
            <strong>Priority:</strong> <span style={{ textTransform: 'capitalize' }}>{item.priority}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn" onClick={() => handleAction(item.id, 'complete', item.workspace_id)}>Mark Reviewed</button>
            <button className="btn btn-secondary" onClick={() => handleAction(item.id, 'skip', item.workspace_id)}>Skip for Now</button>
          </div>
        </div>
      ))}
    </div>
  );
}
