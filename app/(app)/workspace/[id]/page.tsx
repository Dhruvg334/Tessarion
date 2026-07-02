import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getWorkspace } from '@/lib/services/workspaces';
import { listDocuments } from '@/lib/services/documents';
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
  let documents: import('@/types/database').SourceDocument[] = [];
  try {
    workspace = await getWorkspace(id, user.id);
    documents = await listDocuments(id, user.id);
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
        <Link href={`/workspace/${id}/upload`} style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>+ Add Materials</Link>
        <Link href={`/workspace/${id}/reviews`} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '4px', textDecoration: 'none', color: 'var(--foreground)' }}>Review Schedule</Link>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {/* Source Documents Panel */}
        <div style={{ flex: 1 }}>
          <h2>Source Materials</h2>
          {documents.length === 0 ? (
            <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <p className="muted">No documents yet. Add materials to start learning.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {documents.map(doc => (
                <div key={doc.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{doc.file_name}</h4>
                    <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                      Status: {doc.processing_status} • Chunks: {doc.chunk_count}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scaffolded Graph Area */}
        <div style={{ flex: 2 }}>
          <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <h3>Knowledge Graph</h3>
              <p className="muted">Cytoscape visualization coming next. Processing documents will populate nodes here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
