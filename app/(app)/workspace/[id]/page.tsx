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
      <div className="container" style={{ padding: '0 2rem' }}>
        <div className="card" style={{ borderColor: '#ef4444', background: '#fef2f2' }}>
          <h2 style={{ color: '#b91c1c', marginBottom: '0.5rem' }}>Workspace Not Found</h2>
          <p className="muted" style={{ color: '#991b1b' }}>This workspace does not exist or you do not have permission to view it.</p>
          <div style={{ marginTop: '1.5rem' }}><Link href="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '0 2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/dashboard" className="muted" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem' }}>
          ← Back to Notebooks
        </Link>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="title" style={{ marginBottom: '0.25rem' }}>{workspace.name}</h1>
          <p className="muted">{workspace.description || 'No description provided.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href={`/workspace/${id}/upload`} className="btn">+ Add Materials</Link>
          <Link href={`/workspace/${id}/reviews`} className="btn btn-secondary">Review Schedule</Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        {/* Source Documents Panel */}
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Source Materials</h2>
          {documents.length === 0 ? (
            <div className="card" style={{ marginTop: '1rem', textAlign: 'center', background: 'transparent', border: '1px dashed var(--border)', padding: '2rem 1rem' }}>
              <p className="muted" style={{ fontSize: '0.875rem' }}>No documents yet. Add materials to start building context.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {documents.map(doc => (
                <div key={doc.id} className="card" style={{ padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 500 }}>{doc.file_name}</h4>
                  <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>
                    Status: <span style={{ textTransform: 'capitalize' }}>{doc.processing_status}</span> • Chunks: {doc.chunk_count}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scaffolded Graph Area */}
        <div style={{ flex: '2 1 400px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Knowledge Graph</h2>
          <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', border: '1px dashed var(--border)', boxShadow: 'none' }}>
            <div style={{ textAlign: 'center', maxWidth: '300px' }}>
              <p className="muted" style={{ marginBottom: '1rem' }}>[ Interactive visualization coming in Phase 5 ]</p>
              <p className="muted" style={{ fontSize: '0.875rem' }}>Processing documents will populate topics here automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
