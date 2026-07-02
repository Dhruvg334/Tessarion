import { createServerSupabaseClient } from '@/lib/supabase/server';
import { listWorkspaces } from '@/lib/services/workspaces';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let workspaces: import('@/types/database').Workspace[] = [];
  try {
    workspaces = await listWorkspaces(user.id);
  } catch (error) {
    console.error('Failed to load workspaces:', error);
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="title">Dashboard</h1>
        <button style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + New Workspace
        </button>
      </div>
      <p className="muted">Your active workspaces and learning progress.</p>
      
      {workspaces.length === 0 ? (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>No Workspaces Yet</h3>
          <p className="muted">Create your first workspace to begin learning.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          {workspaces.map((ws) => (
            <Link key={ws.id} href={'/workspace/' + ws.id}>
              <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>{ws.name}</h3>
                <p className="muted">{ws.description || 'No description provided.'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}