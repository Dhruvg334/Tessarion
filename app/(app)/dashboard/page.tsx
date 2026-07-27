import Link from 'next/link';
import { Info } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CreateWorkspaceForm } from '@/components/workspace/create-workspace-form';
import { SystemReadinessCard } from '@/components/system/system-readiness-card';
import { getSystemReadiness } from '@/lib/system/readiness';
import type { Workspace } from '@/types/database';
import { InfoDialog } from '@/components/ui/info-dialog';

export const metadata = { title: 'Dashboard | Tessarion' };

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
  if (!user) redirect('/login?next=/dashboard');

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  const workspaces = (data ?? []) as Workspace[];
  const readiness = getSystemReadiness();

  return (
    <div className="app-page dashboard-page">
      <div className="container-wide">
        <header className="dashboard-hero dashboard-hero-refined">
          <div>
            <p className="eyebrow">Learning workspace</p>
            <h1>Continue where understanding broke down.</h1>
            <p>Open a notebook, add evidence, inspect its concept structure, or return to the next recommended learning action.</p>
          </div>
          <Link className="btn" href="#create-notebook">Create notebook</Link>
        </header>

        {error ? <div className="notice" role="alert">Tessarion could not load your notebooks. Refresh the page or verify the Supabase connection.</div> : null}

        <div className="dashboard-overview-strip" aria-label="Dashboard summary">
          <div><strong>{workspaces.length}</strong><span>active notebooks</span></div>
          <div><strong>{readiness.overall === 'ready' ? 'Ready' : 'Limited'}</strong><span>system state</span></div>
          <div><strong>7</strong><span>learning surfaces</span></div>
        </div>

        <section className="dashboard-explainer-row" aria-label="Dashboard guidance">
          {[
            ['Notebooks', 'Each notebook isolates its sources, concepts, explanations, reviews, and traces.'],
            ['System state', 'Ready means the configured services can support the complete learning loop. Limited means deterministic features remain available while one or more external services are absent.'],
            ['Next action', 'Tessarion chooses the next step from source evidence, diagnosis, mastery signals, and review state.'],
          ].map(([title, copy]) => (
            <InfoDialog key={title} trigger={<button type="button" className="dashboard-info-chip"><Info size={15} /><span>{title}</span></button>} title={title} description="How to read this dashboard">
              <p>{copy}</p>
            </InfoDialog>
          ))}
        </section>

        <section className="dashboard-refined-layout">
          <main className="dashboard-workspaces">
            <div className="dashboard-section-heading">
              <div><p className="eyebrow">Your notebooks</p><h2>Current subjects</h2></div>
              <p>Sources, concepts, explanations, reviews, and traces stay isolated inside each notebook.</p>
            </div>

            {workspaces.length === 0 ? (
              <div className="dashboard-empty">
                <h3>Create your first notebook</h3>
                <p>Start with one subject and one short source passage. The system will build the evidence base before asking you to explain anything.</p>
              </div>
            ) : (
              <div className="workspace-card-grid">
                {workspaces.map((workspace, index) => (
                  <article className="workspace-card-refined" key={workspace.id}>
                    <div className="workspace-card-top"><span>{String(index + 1).padStart(2, '0')}</span><p>Notebook</p></div>
                    <div><h3>{workspace.name}</h3><p>{workspace.description || 'No description yet.'}</p></div>
                    <nav className="workspace-card-links" aria-label={`${workspace.name} sections`}>
                      {workspaceDestinations.map(([label, panel]) => <Link key={panel} href={`/workspace/${workspace.id}?panel=${panel}`}>{label}</Link>)}
                    </nav>
                    <Link className="btn workspace-card-open" href={`/workspace/${workspace.id}?panel=study`}>Open notebook</Link>
                  </article>
                ))}
              </div>
            )}
          </main>

          <aside className="dashboard-side-rail">
            <div id="create-notebook" className="dashboard-create-card"><CreateWorkspaceForm /></div>
            <SystemReadinessCard readiness={readiness} compact />
            <section className="dashboard-route-guide">
              <p className="eyebrow">How to use the system</p>
              <ol><li>Add source material.</li><li>Inspect extracted concepts.</li><li>Teach one concept back.</li><li>Follow the evidence-backed next action.</li></ol>
              <Link href="/demo/notebook">See the public example</Link>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}
