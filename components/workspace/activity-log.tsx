import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface ActivityEvent {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error';
  safe_message: string;
  entity_type: string | null;
  entity_id: string | null;
  request_id: string | null;
  trace_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function humanize(value: string) {
  return value.replaceAll('_', ' ');
}

function eventCategory(type: string) {
  if (type.startsWith('source_') || type.startsWith('concept_')) return 'Knowledge model';
  if (type.startsWith('teach_back') || type === 'mastery_updated') return 'Diagnosis';
  if (type.startsWith('tutoring_')) return 'Tutor';
  if (type.startsWith('review_')) return 'Review';
  if (type.includes('failed') || type === 'api_error' || type === 'validation_failed') return 'System';
  return 'Workspace';
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export async function ActivityLog({ workspaceId, selectedTraceId }: { workspaceId: string; selectedTraceId?: string }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="activity-state is-error"><strong>Activity unavailable</strong><span>Sign in again to inspect this notebook.</span></div>;

  const { data, error } = await supabase
    .from('operational_events')
    .select('id, event_type, severity, safe_message, entity_type, entity_id, request_id, trace_id, metadata, created_at')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return <div className="activity-state is-error"><strong>Activity could not be loaded</strong><span>The notebook remains usable. Try this view again later.</span></div>;
  const events = (data ?? []) as ActivityEvent[];
  if (events.length === 0) return <div className="activity-state"><strong>No activity recorded yet</strong><span>Add a source or complete a teach-back to create an auditable learning trail.</span></div>;

  const traceEvents = selectedTraceId ? events.filter((event) => event.trace_id === selectedTraceId) : [];
  const groups = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const key = event.trace_id || event.request_id || `${event.event_type}:${event.created_at.slice(0, 10)}`;
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }

  return (
    <div className="activity-workspace">
      <header className="activity-header"><div><p className="eyebrow">Operational history</p><h2>Activity and decision traces</h2><p>Safe lifecycle events explain what ran, which stage completed, and where a workflow stopped. Source text and private responses are not stored here.</p></div><div className="activity-summary"><strong>{events.length}</strong><span>recent events</span><strong>{[...groups.keys()].length}</strong><span>run groups</span></div></header>

      {selectedTraceId ? (
        <section className="trace-inspector">
          <div className="trace-inspector-head"><div><p className="eyebrow">Trace inspector</p><h3>{selectedTraceId.slice(0, 12)}</h3></div><Link href={`/workspace/${workspaceId}?panel=activity`} className="btn btn-secondary">Close trace</Link></div>
          {traceEvents.length ? <ol>{[...traceEvents].reverse().map((event, index) => <li key={event.id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{humanize(event.event_type)}</strong><p>{event.safe_message}</p><small>{event.entity_type ? `${humanize(event.entity_type)} · ` : ''}{timeLabel(event.created_at)}</small></div><em data-severity={event.severity}>{event.severity}</em></li>)}</ol> : <div className="activity-state"><strong>Trace details are unavailable</strong><span>The trace may be older than the current activity window or may have been redacted.</span></div>}
        </section>
      ) : null}

      <div className="activity-group-list">
        {[...groups.entries()].map(([groupId, groupEvents]) => {
          const newest = groupEvents[0];
          const traceId = newest.trace_id;
          return <article key={groupId} className="activity-group"><div className="activity-group-marker" data-severity={newest.severity} /><div className="activity-group-body"><header><div><span>{eventCategory(newest.event_type)}</span><h3>{newest.safe_message}</h3></div><time>{timeLabel(newest.created_at)}</time></header><div className="activity-group-meta"><span>{groupEvents.length} event{groupEvents.length === 1 ? '' : 's'}</span><span>{humanize(newest.event_type)}</span>{newest.entity_type ? <span>{humanize(newest.entity_type)}</span> : null}</div>{traceId ? <Link href={`/workspace/${workspaceId}?panel=activity&trace=${traceId}`}>Inspect trace</Link> : <span className="activity-muted">No trace identifier</span>}</div></article>;
        })}
      </div>
    </div>
  );
}
