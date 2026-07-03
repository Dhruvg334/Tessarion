import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getWorkspace } from '@/lib/services/workspaces';
import { listDocuments } from '@/lib/services/documents';
import { getWorkspaceGraph } from '@/lib/services/graph';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceGraphViewer } from '@/components/graph/workspace-graph-viewer';
import { DocumentList } from '@/components/workspace/document-list';

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let workspace;
  let documents: import('@/types/database').SourceDocument[] = [];
  let initialGraph = null;
  try {
    workspace = await getWorkspace(id, user.id);
    documents = await listDocuments(id, user.id);
    initialGraph = await getWorkspaceGraph(id, user.id);
  } catch {
    return (
      <div className="container" style={{ padding: '0 2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--ink)', background: 'var(--paper)' }}>
          <h2 style={{ color: 'var(--ink)', marginBottom: '0.5rem', fontWeight: 600 }}>Workspace Not Found</h2>
          <p className="muted">This workspace does not exist or you do not have permission to view it.</p>
          <div style={{ marginTop: '1.5rem' }}><Link href="/dashboard" className="btn btn-secondary">← Back to Notebooks</Link></div>
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
          <DocumentList documents={documents} workspaceId={id} />
        </div>

        {/* Scaffolded Graph Area */}
        <div style={{ flex: '2 1 400px' }}>
          <div className="flex justify-between items-center pb-3 mb-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Knowledge Graph</h2>
          </div>
          <WorkspaceGraphViewer initialGraph={initialGraph} workspaceId={id} />
        </div>
      </div>
    </div>
  );
}
