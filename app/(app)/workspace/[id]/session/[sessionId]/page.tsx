import Link from 'next/link';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';

export default async function SessionPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = await params;
  return <div className="app-page workspace-subpage"><div className="container-wide"><div className="workspace-breadcrumb"><Link href="/dashboard">Dashboard</Link><span>/</span><Link href={`/workspace/${id}`}>Notebook</Link><span>/</span><span>Session</span></div><WorkspaceShell workspaceId={id} workspaceName="Current notebook"><header className="workspace-subpage-header"><div><p className="eyebrow">Learning session</p><h1>Session unavailable in this view</h1><p>The active teach-back and tutoring experiences now open through the notebook navigation so evidence, review state, and trace context stay together.</p></div></header><div className="workspace-session-note"><code>{sessionId}</code><Link className="btn" href={`/workspace/${id}?panel=teach-back`}>Return to teach-back</Link></div></WorkspaceShell></div></div>;
}
