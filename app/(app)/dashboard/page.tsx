import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoadingState } from '@/components/shell/loading-state';
import { EmptyState } from '@/components/shell/empty-state';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CreateWorkspaceForm } from '@/components/workspace/create-workspace-form';

export const metadata = {
  title: 'Dashboard | Tessarion',
};

async function DashboardWorkspaces() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?next=/dashboard');
  }

  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div style={{ padding: '1rem', border: '1px solid var(--ink)', backgroundColor: 'var(--paper)', color: 'var(--ink)' }}>
        <strong style={{ fontWeight: 600 }}>Error:</strong> Failed to load notebooks. {error.message}
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <EmptyState 
        title="No Notebooks Yet" 
        description="Notebooks are where you organize source materials and concepts for a specific subject." 
      />
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {workspaces.map((ws) => (
        <Link key={ws.id} href={`/workspace/${ws.id}`} style={{ textDecoration: 'none' }}>
          <article className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--ink-light)', transition: 'border-color 0.2s', cursor: 'pointer' }}>
            <div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--ink)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ws.name}</h3>
              {ws.description && (
                <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ws.description}</p>
              )}
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--ink)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Continue this notebook
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="container-wide" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }} className="dashboard-grid-responsive">
        <aside>
          <CreateWorkspaceForm />
        </aside>

        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem', color: 'var(--ink)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--ink-soft)' }}>
            Your Notebooks
          </h2>

          <Suspense fallback={<LoadingState type="panel" message="Loading notebooks..." />}>
            <DashboardWorkspaces />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
