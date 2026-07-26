import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getWorkspace } from '@/lib/services/workspaces';
import { listDocuments } from '@/lib/services/documents';
import { getWorkspaceGraph } from '@/lib/services/graph';
import { getWorkspaceReviewQueue } from '@/lib/services/review';
import { getTutoringSession } from '@/lib/services/tutoring';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceGraphViewer } from '@/components/graph/workspace-graph-viewer';
import { DocumentList } from '@/components/workspace/document-list';
import { EmptyState } from '@/components/shell/empty-state';
import { NextActionPanel } from '@/components/review/next-action-panel';
import { ReviewQueue } from '@/components/review/review-queue';
import { TutoringPanel } from '@/components/tutoring/tutoring-panel';
import { ActivityLog } from '@/components/workspace/activity-log';
import { resolveNextAction, type NextActionContext } from '@/lib/product/next-action';
import type { SourceDocument } from '@/types/database';
import { getSystemReadiness } from '@/lib/system/readiness';
import { SystemReadinessCard } from '@/components/system/system-readiness-card';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';

const PANELS = [
  { id: 'study', label: 'Study Board' },
  { id: 'sources', label: 'Sources' },
  { id: 'graph', label: 'Knowledge Graph' },
  { id: 'teach-back', label: 'Teach-Back' },
  { id: 'review', label: 'Reviews' },
  { id: 'activity', label: 'Activity' },
];

const validPanelIds = new Set([...PANELS.map((panel) => panel.id), 'tutoring']);

export default async function WorkspacePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ panel?: string; tutoring?: string }>;
}) {
  const { id } = await props.params;
  const { panel, tutoring: tutoringSessionId } = await props.searchParams;
  const requestedPanel = tutoringSessionId ? 'tutoring' : (panel || 'study');
  const currentPanel = validPanelIds.has(requestedPanel) ? requestedPanel : 'study';

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/workspace/${id}`);
  }

  // Only the canonical workspace lookup can produce the not-found screen.
  // Optional projections must degrade independently rather than hiding a valid workspace.
  let workspace;
  try {
    workspace = await getWorkspace(id, user.id);
  } catch {
    return (
      <div className="app-page">
        <div className="container">
          <div className="workspace-not-found">
            <p className="eyebrow">Workspace access</p>
            <h1>Workspace not found</h1>
            <p>This notebook does not exist, is archived, or is not owned by the signed-in account.</p>
            <Link href="/dashboard" className="btn btn-secondary">Back to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const [documentsResult, graphResult, queueResult, teachBackResult, tutoringListResult] = await Promise.allSettled([
    listDocuments(id, user.id),
    getWorkspaceGraph(id, user.id),
    getWorkspaceReviewQueue(id, user.id),
    supabase.from('teach_back_sessions').select('id, status').eq('workspace_id', id),
    supabase.from('tutoring_sessions').select('id, status').eq('workspace_id', id),
  ]);

  const documents: SourceDocument[] = documentsResult.status === 'fulfilled' ? documentsResult.value : [];
  const initialGraph = graphResult.status === 'fulfilled' ? graphResult.value : null;
  const reviewQueue = queueResult.status === 'fulfilled' ? queueResult.value : [];
  const teachBackRows = teachBackResult.status === 'fulfilled' ? (teachBackResult.value.data ?? []) : [];
  const tutoringRows = tutoringListResult.status === 'fulfilled' ? (tutoringListResult.value.data ?? []) : [];
  const degradedSections = [
    documentsResult.status === 'rejected' ? 'sources' : null,
    graphResult.status === 'rejected' ? 'knowledge graph' : null,
    queueResult.status === 'rejected' ? 'review queue' : null,
    teachBackResult.status === 'rejected' ? 'teach-back history' : null,
    tutoringListResult.status === 'rejected' ? 'tutoring history' : null,
  ].filter(Boolean) as string[];

  let tutoringSessionObj = null;
  if (tutoringSessionId) {
    try {
      tutoringSessionObj = await getTutoringSession(id, user.id, tutoringSessionId);
    } catch {
      tutoringSessionObj = null;
    }
  }

  const activeTutoringSessions = tutoringRows.filter((session) => session.status === 'active');
  const completedTutoringSessionsThisSession = tutoringRows.filter(
    (session) => session.status === 'completed' || session.status === 'needs_review',
  );

  const context: NextActionContext = {
    workspaceId: id,
    sourceDocumentCount: documents.length,
    conceptCount: initialGraph?.nodes?.length || 0,
    teachBackSessionCount: teachBackRows.length,
    activeTutoringSessions,
    completedTutoringSessionsThisSession,
    reviewQueue,
    masterySummary: [],
  };
  const nextAction = resolveNextAction(context);
  const readiness = getSystemReadiness();

  const contextRail = currentPanel === 'study' ? (
    <>
      <SystemReadinessCard readiness={readiness} compact />
      <section className="workspace-context-card">
        <div className="workspace-context-card-head">
          <div><p className="eyebrow">Graph preview</p><h2>Concept structure</h2></div>
          <Link href={`/workspace/${id}?panel=graph`}>Open</Link>
        </div>
        <div className="graph-preview-surface compact">
          {documents.length === 0 ? (
            <EmptyState title="Add your first source" description="A source is required before Tessarion can build evidence-linked concepts." action={<Link href={`/workspace/${id}/upload`} className="btn">Add source</Link>} />
          ) : <WorkspaceGraphViewer initialGraph={initialGraph} workspaceId={id} compact />}
        </div>
      </section>
    </>
  ) : undefined;

  return (
    <div className="app-page workspace-page">
      <div className="container-wide">
        <div className="workspace-breadcrumb"><Link href="/dashboard">Dashboard</Link><span aria-hidden="true">/</span><span>{workspace.name}</span></div>

        <section className="workspace-command-header">
          <div className="workspace-command-copy">
            <p className="eyebrow">Notebook</p><h1>{workspace.name}</h1>
            <p>{workspace.description || 'Add a short description to define the learning scope.'}</p>
          </div>
          <div className="workspace-command-actions"><Link href="/demo/notebook" className="btn btn-secondary">View example</Link><Link href={`/workspace/${id}/upload`} className="btn">Add source</Link></div>
        </section>

        {degradedSections.length > 0 ? <div className="workspace-degraded-notice" role="status"><strong>Partial data available</strong><span>{degradedSections.join(', ')} could not be loaded. Other sections remain usable.</span></div> : null}

        <WorkspaceShell workspaceId={id} workspaceName={workspace.name} context={contextRail}>
          <div className="workspace-main-toolbar">
            <div className="workspace-facts-compact" aria-label="Workspace summary">
              <div><strong>{documents.length}</strong><span>sources</span></div><div><strong>{initialGraph?.nodes?.length || 0}</strong><span>concepts</span></div><div><strong>{reviewQueue.length}</strong><span>reviews</span></div><div><strong>{activeTutoringSessions.length}</strong><span>tutor sessions</span></div>
            </div>
          </div>

          {currentPanel === 'study' && <div className="workspace-study-main">
            <section className="workspace-action-section"><div className="workspace-section-heading"><div><p className="eyebrow">Current route</p><h2>What to do next</h2></div></div><NextActionPanel action={nextAction} /></section>
            <section className="workspace-modules-section"><div className="workspace-section-heading"><div><p className="eyebrow">Learning surfaces</p><h2>Move through the notebook</h2></div></div><div className="workspace-module-grid refined">
              <Link className="workspace-module" href={`/workspace/${id}?panel=sources`}><span>01</span><h3>Sources</h3><p>Inspect evidence and processing state.</p></Link>
              <Link className="workspace-module" href={`/workspace/${id}?panel=graph`}><span>02</span><h3>Knowledge graph</h3><p>Explore concepts and dependencies.</p></Link>
              <Link className="workspace-module" href={`/workspace/${id}?panel=teach-back`}><span>03</span><h3>Teach-back</h3><p>Explain a concept and surface gaps.</p></Link>
              <Link className="workspace-module" href={`/workspace/${id}?panel=review`}><span>04</span><h3>Reviews</h3><p>Work through scheduled corrections.</p></Link>
            </div></section>
          </div>}

          {currentPanel === 'sources' && <section className="workspace-panel"><div className="workspace-section-heading"><div><p className="eyebrow">Evidence base</p><h2>Source materials</h2></div><Link href={`/workspace/${id}/upload`} className="btn">Add source</Link></div>{documents.length === 0 ? <EmptyState title="No source documents" description="Add a passage, note, or document to begin." action={<Link href={`/workspace/${id}/upload`} className="btn">Add source</Link>} /> : <DocumentList documents={documents} workspaceId={id} />}</section>}

          {currentPanel === 'graph' && <section className="workspace-panel"><div className="workspace-section-heading"><div><p className="eyebrow">Relational model</p><h2>Knowledge graph</h2></div></div><div className="graph-full-surface">{documents.length === 0 ? <EmptyState title="No concepts yet" description="Add and process source material first." action={<Link href={`/workspace/${id}/upload`} className="btn">Add source</Link>} /> : <WorkspaceGraphViewer initialGraph={initialGraph} workspaceId={id} />}</div></section>}

          {currentPanel === 'teach-back' && <section className="workspace-panel workspace-panel-narrow"><div className="workspace-section-heading"><div><p className="eyebrow">Active recall</p><h2>Teach-back</h2></div></div>{!initialGraph?.nodes?.length ? <EmptyState title="Teach-back is not ready" description="Extract at least one concept from source material first." action={<Link href={`/workspace/${id}?panel=sources`} className="btn btn-secondary">Go to sources</Link>} /> : <EmptyState title="Choose a concept" description="Open the knowledge graph and select a concept to begin explaining it." action={<Link href={`/workspace/${id}?panel=graph`} className="btn">Choose from graph</Link>} />}</section>}

          {currentPanel === 'review' && <section className="workspace-panel workspace-panel-narrow"><ReviewQueue workspaceId={id} /></section>}
          {currentPanel === 'tutoring' && tutoringSessionObj && <section className="workspace-panel workspace-panel-narrow"><TutoringPanel workspaceId={id} session={tutoringSessionObj.session} initialTurns={tutoringSessionObj.turns} /></section>}
          {currentPanel === 'tutoring' && !tutoringSessionObj && <section className="workspace-panel workspace-panel-narrow"><EmptyState title="Tutor session unavailable" description="The requested tutoring session could not be loaded." action={<Link href={`/workspace/${id}?panel=study`} className="btn btn-secondary">Return to study board</Link>} /></section>}
          {currentPanel === 'activity' && <section className="workspace-panel workspace-panel-narrow"><ActivityLog workspaceId={id} /></section>}
        </WorkspaceShell>
      </div>
    </div>
  );
}
