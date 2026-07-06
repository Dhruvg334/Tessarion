import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getWorkspace } from '@/lib/services/workspaces';
import { listDocuments } from '@/lib/services/documents';
import { getWorkspaceGraph } from '@/lib/services/graph';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceGraphViewer } from '@/components/graph/workspace-graph-viewer';
import { DocumentList } from '@/components/workspace/document-list';
import { ProductPanelNav } from '@/components/shell/product-panel-nav';
import { EmptyState } from '@/components/shell/empty-state';

const PANELS = [
  { id: 'study', label: 'Study Board' },
  { id: 'sources', label: 'Source Materials' },
  { id: 'graph', label: 'Knowledge Graph' },
  { id: 'teach-back', label: 'Teach-Back' },
  { id: 'review', label: 'Review' }
];

export default async function WorkspacePage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ panel?: string }> }) {
  const { id } = await props.params;
  const { panel } = await props.searchParams;
  const currentPanel = panel || 'study';
  
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
    <div className="container-wide" style={{ padding: '0 2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/dashboard" className="muted" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem' }}>
          ← Back to Notebooks
        </Link>
      </div>
      
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="title" style={{ marginBottom: '0.25rem', fontSize: '2rem' }}>{workspace.name}</h1>
            <p className="muted">{workspace.description || 'No description provided.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href={`/workspace/${id}/upload`} className="btn">+ Add Materials</Link>
          </div>
        </div>
      </header>

      <ProductPanelNav panels={PANELS} defaultPanel="study" />

      {/* Panel Content Regions */}
      
      {currentPanel === 'study' && (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 3fr)' }} className="dashboard-grid-responsive">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>Source Summary</h2>
              <div style={{ color: 'var(--ink-soft)' }}>
                {documents.length > 0 ? (
                  <p>{documents.length} document{documents.length === 1 ? '' : 's'} added.</p>
                ) : (
                  <p>No sources yet. Add materials to begin.</p>
                )}
                <div style={{ marginTop: '1rem' }}>
                  <Link href={`/workspace/${id}/upload`} className="btn btn-secondary" style={{ width: '100%' }}>Add Materials</Link>
                </div>
              </div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>Teach-Back Status</h2>
              <div style={{ color: 'var(--ink-soft)' }}>
                {initialGraph?.nodes?.length ? (
                  <p>Ready for teach-back. Select a concept in the graph to explain it.</p>
                ) : (
                  <p>Teach-back unlocks after at least one concept is available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>Knowledge Graph Preview</h2>
            <div style={{ flex: 1, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
              {documents.length === 0 ? (
                <EmptyState 
                  title="No source material yet" 
                  description="Add a page, note, or excerpt so Tessarion can build your concept graph." 
                  action={<Link href={`/workspace/${id}/upload`} className="btn">Add Materials</Link>}
                />
              ) : (
                <WorkspaceGraphViewer initialGraph={initialGraph} workspaceId={id} />
              )}
            </div>
          </div>
        </div>
      )}

      {currentPanel === 'sources' && (
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Source Materials</h2>
            <Link href={`/workspace/${id}/upload`} className="btn">Add Materials</Link>
          </div>
          {documents.length === 0 ? (
            <EmptyState 
              title="No Documents" 
              description="You have not added any source documents to this notebook yet." 
              action={<Link href={`/workspace/${id}/upload`} className="btn">Add Materials</Link>}
            />
          ) : (
            <DocumentList documents={documents} workspaceId={id} />
          )}
        </div>
      )}

      {currentPanel === 'graph' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Knowledge Graph</h2>
          </div>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {documents.length === 0 ? (
              <EmptyState 
                title="No Concepts Yet" 
                description="Extract concepts from your source material before starting." 
                action={<Link href={`/workspace/${id}/upload`} className="btn">Add Materials</Link>}
              />
            ) : (
              <WorkspaceGraphViewer initialGraph={initialGraph} workspaceId={id} />
            )}
          </div>
        </div>
      )}

      {currentPanel === 'teach-back' && (
        <div style={{ maxWidth: '800px' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Teach-Back</h2>
          </div>
          
          {(!initialGraph?.nodes || initialGraph.nodes.length === 0) ? (
            <EmptyState 
              title="Teach-Back Unavailable" 
              description="Teach-back unlocks after at least one concept is available. Extract concepts from your source material first." 
              action={<Link href={`/workspace/${id}?panel=sources`} className="btn btn-secondary">Go to Sources</Link>}
            />
          ) : (
            <EmptyState 
              title="Select a Concept" 
              description="To start a teach-back session, go to the Study Board or Knowledge Graph panel and select a concept." 
              action={<Link href={`/workspace/${id}?panel=graph`} className="btn">Go to Graph</Link>}
            />
          )}
        </div>
      )}

      {currentPanel === 'review' && (
        <div style={{ maxWidth: '800px' }}>
          <EmptyState 
            title="Next Planned Capability" 
            description="Review scheduling will become available after mastery scoring." 
          />
        </div>
      )}

    </div>
  );
}
