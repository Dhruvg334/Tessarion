import Link from 'next/link';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="app-page workspace-subpage"><div className="container-wide"><div className="workspace-breadcrumb"><Link href="/dashboard">Dashboard</Link><span>/</span><Link href={`/workspace/${id}`}>Notebook</Link><span>/</span><span>Settings</span></div><WorkspaceShell workspaceId={id} workspaceName="Current notebook"><header className="workspace-subpage-header"><div><p className="eyebrow">Notebook controls</p><h1>Settings</h1><p>Configuration is deliberately limited until rename, archive, export, and deletion operations have complete authorization and audit coverage.</p></div></header><section className="workspace-status-grid"><article><span>Available</span><h2>Workspace isolation</h2><p>Every source, concept, review, and trace remains scoped to this notebook and its owner.</p></article><article><span>Planned</span><h2>Lifecycle controls</h2><p>Rename, archive, export, and permanent deletion will be added with explicit confirmation and trace records.</p></article></section></WorkspaceShell></div></div>;
}
