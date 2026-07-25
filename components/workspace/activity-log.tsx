import { createServerSupabaseClient } from '@/lib/supabase/server';

interface ActivityEvent {
  id: string;
  event_type: string;
  safe_message: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}

export async function ActivityLog({ workspaceId }: { workspaceId: string }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--error)' }}>
        <p style={{ color: 'var(--error)' }}>Unauthorized</p>
      </div>
    );
  }

  const { data: events, error } = await supabase
    .from('operational_events')
    .select('id, event_type, safe_message, entity_type, entity_id, created_at')
    .eq('workspace_id', workspaceId)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--error)' }}>
        <p style={{ color: 'var(--error)' }}>Failed to load activity log.</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="muted">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ borderBottom: '1px solid var(--line)', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Activity Log</h2>
        <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Recent actions and lifecycle events in this workspace.
        </p>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {events.map((ev: ActivityEvent) => (
            <li key={ev.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 500, color: 'var(--ink)' }}>{ev.safe_message}</p>
                  <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Type: <span style={{ fontFamily: 'monospace' }}>{ev.event_type}</span>
                    {ev.entity_type && ` • Entity: ${ev.entity_type}`}
                  </p>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {new Date(ev.created_at).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
