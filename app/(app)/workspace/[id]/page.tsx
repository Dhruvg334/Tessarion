import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getWorkspace } from '@/lib/services/workspaces';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let workspace;
  try {
    workspace = await getWorkspace(id, user.id);
  } catch {
    return (
      <div className="container">
        <div className="card" style={{ borderColor: 'red' }}>
          <h2 style={{ color: 'red' }}>Workspace Not Found</h2>
          <p className="muted">This workspace does not exist or you do not have permission to view it.</p>
          <div style={{ marginTop: '1rem' }}><Link href="/dashboard">← Back to Dashboard</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}><Link href="/dashboard" className="muted">← Back to Dashboard</Link></div>
      <h1 className="title">{workspace.name}</h1>
      <p className="muted">{workspace.description || 'No description'}</p>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link href={'/workspace/' + id + '/upload'} style={{ color: 'var(--accent)' }}>Upload Materials</Link>
        <Link href={'/workspace/' + id + '/reviews'} style={{ color: 'var(--accent)' }}>Review Schedule</Link>
      </div>

      <div className="card" style={{ marginTop: '2rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Scaffolded Graph View</h3>
          <p className="muted">Cytoscape visualization coming next.</p>
        </div>
      </div>
    </div>
  );
}