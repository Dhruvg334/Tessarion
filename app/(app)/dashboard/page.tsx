import Link from 'next/link';
import { ArrowRight, BookOpen, GitFork, MessageSquareText, RotateCcw } from 'lucide-react';
import { redirect } from 'next/navigation';

import { CreateWorkspaceDialog } from '@/components/dashboard/create-workspace-dialog';
import { SystemReadinessCard } from '@/components/system/system-readiness-card';
import { getSystemReadiness } from '@/lib/system/readiness';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Workspace } from '@/types/database';

export const metadata = { title: 'Dashboard | Tessarion' };

const workspaceDestinations = [
  ['Study board', 'study'],
  ['Sources', 'sources'],
  ['Graph', 'graph'],
  ['Teach-back', 'teach-back'],
  ['Reviews', 'review'],
] as const;

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/dashboard');

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('updated_at', { ascending: false });

  const workspaces = (data ?? []) as Workspace[];
  const readiness = getSystemReadiness();
  const firstWorkspace = workspaces[0];

  return (
    <div className="app-page dashboard-page dashboard-page-compact">
      <div className="container-wide">
        <header className="dashboard-command-header">
          <div>
            <p className="eyebrow">Your learning workspace</p>
            <h1>Continue learning.</h1>
            <p>Open a notebook or begin with one focused source.</p>
          </div>
          <div className="dashboard-command-actions">
            {firstWorkspace ? <Link className="btn btn-secondary" href={`/workspace/${firstWorkspace.id}?panel=study`}>Resume latest <ArrowRight size={16} /></Link> : null}
            <CreateWorkspaceDialog />
          </div>
        </header>

        {error ? <div className="notice" role="alert">Your notebooks could not be loaded. Refresh the page or check the Supabase connection.</div> : null}

        <section className="dashboard-quick-strip" aria-label="Dashboard summary and shortcuts">
          <div className="dashboard-stat"><strong>{workspaces.length}</strong><span>active notebooks</span></div>
          <Link href={firstWorkspace ? `/workspace/${firstWorkspace.id}?panel=sources` : '#notebooks'}><BookOpen size={17} /><span>Sources</span></Link>
          <Link href={firstWorkspace ? `/workspace/${firstWorkspace.id}?panel=graph` : '#notebooks'}><GitFork size={17} /><span>Knowledge graph</span></Link>
          <Link href={firstWorkspace ? `/workspace/${firstWorkspace.id}?panel=teach-back` : '#notebooks'}><MessageSquareText size={17} /><span>Teach-back</span></Link>
          <Link href={firstWorkspace ? `/workspace/${firstWorkspace.id}?panel=review` : '#notebooks'}><RotateCcw size={17} /><span>Reviews</span></Link>
        </section>

        <section id="notebooks" className="dashboard-notebook-section">
          <div className="dashboard-section-heading dashboard-section-heading-compact">
            <div><p className="eyebrow">Notebooks</p><h2>Your subjects</h2></div>
            <span>{readiness.overall === 'ready' ? 'System ready' : 'Local fallbacks active'}</span>
          </div>

          {workspaces.length === 0 ? (
            <div className="dashboard-empty dashboard-empty-compact">
              <div><h3>No notebooks yet</h3><p>Create one notebook, add a short source, and let Tessarion build the evidence base.</p></div>
              <CreateWorkspaceDialog />
            </div>
          ) : (
            <div className="workspace-card-grid workspace-card-grid-compact">
              {workspaces.map((workspace, index) => (
                <article className="workspace-card-refined workspace-card-compact" key={workspace.id}>
                  <div className="workspace-card-top"><span>{String(index + 1).padStart(2, '0')}</span><p>Notebook</p></div>
                  <div className="workspace-card-copy"><h3>{workspace.name}</h3><p>{workspace.description || 'No description yet.'}</p></div>
                  <nav className="workspace-card-links" aria-label={`${workspace.name} sections`}>
                    {workspaceDestinations.map(([label, panel]) => <Link key={panel} href={`/workspace/${workspace.id}?panel=${panel}`}>{label}</Link>)}
                  </nav>
                  <Link className="workspace-card-primary" href={`/workspace/${workspace.id}?panel=study`}>Open notebook <ArrowRight size={16} /></Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-system-drawer" aria-label="System readiness">
          <details>
            <summary>System readiness and provider status</summary>
            <SystemReadinessCard readiness={readiness} compact />
          </details>
        </section>
      </div>
    </div>
  );
}
