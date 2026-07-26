import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CreateWorkspaceForm } from '@/components/workspace/create-workspace-form';
import type { Workspace } from '@/types/database';

export const metadata = {
  title: 'Dashboard | Tessarion',
};

const workspaceDestinations = [
  ['Study board', 'study'],
  ['Sources', 'sources'],
  ['Knowledge graph', 'graph'],
  ['Teach-back', 'teach-back'],
  ['Reviews', 'review'],
  ['Activity', 'activity'],
] as const;

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  const workspaces = (data ?? []) as Workspace[];

  return (
    <div className="app-page dashboard-page">
      <div className="container-wide">
        <header className="dashboard-hero">
          <div>
            <p className="eyebrow">Learning workspaces</p>
            <h1>Dashboard</h1>
            <p>Continue a subject, add evidence, inspect its concept graph, or return to a teach-back session.</p>
          </div>
          <div className="dashboard-hero-note">
            <span>{workspaces.length}</span>
            <p>{workspaces.length === 1 ? 'active notebook' : 'active notebooks'}</p>
          </div>
        </header>

        {error ? (
          <div className="notice" role="alert">
            Tessarion could not load your notebooks. Refresh the page or verify the Supabase connection.
          </div>
        ) : null}

        <section className="dashboard-layout" aria-label="Workspace dashboard">
          <aside className="dashboard-create-panel">
            <CreateWorkspaceForm />
            <div className="dashboard-capability-note">
              <p className="eyebrow">Inside every notebook</p>
              <ul>
                <li>Source material and evidence</li>
                <li>Concept and prerequisite graph</li>
                <li>Teach-back diagnosis</li>
                <li>Review and tutoring actions</li>
                <li>Activity and trace history</li>
              </ul>
            </div>
          </aside>

          <div className="dashboard-workspaces">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Your notebooks</p>
                <h2>Continue learning</h2>
              </div>
              <p>Each notebook keeps its sources, concepts, learning state, and review history separate.</p>
            </div>

            {workspaces.length === 0 ? (
              <div className="dashboard-empty">
                <h3>Create your first notebook</h3>
                <p>Start with one subject and add a short source passage. Tessarion will use it as the evidence base for later learning actions.</p>
              </div>
            ) : (
              <div className="workspace-list">
                {workspaces.map((workspace, index) => (
                  <article className="workspace-row" key={workspace.id}>
                    <div className="workspace-row-index" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="workspace-row-main">
                      <div className="workspace-row-copy">
                        <h3>{workspace.name}</h3>
                        <p>{workspace.description || 'No description yet.'}</p>
                      </div>
                      <Link className="btn workspace-primary-action" href={`/workspace/${workspace.id}?panel=study`}>
                        Open notebook
                      </Link>
                    </div>
                    <nav className="workspace-shortcuts" aria-label={`${workspace.name} sections`}>
                      {workspaceDestinations.map(([label, panel]) => (
                        <Link key={panel} href={`/workspace/${workspace.id}?panel=${panel}`}>
                          {label}
                        </Link>
                      ))}
                    </nav>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
