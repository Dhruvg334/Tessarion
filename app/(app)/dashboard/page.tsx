'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/shell/loading-state';
import { EmptyState } from '@/components/shell/empty-state';

type Workspace = import('@/types/database').Workspace;

function DashboardContent() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const wsRes = await fetch('/api/workspaces');
        
        if (wsRes.status === 401) {
          router.push('/login?next=/dashboard');
          return;
        }

        const wsJson = await wsRes.json();
        if (!wsRes.ok) {
          setError(wsJson?.error || 'Failed to load notebooks.');
          return;
        }

        setWorkspaces(wsJson.data || []);
      } catch {
        setError('Could not reach the API.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError('Notebook title cannot be empty.');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, description: newDesc.trim() }),
      });

      if (res.status === 401) {
        router.push('/login?next=/dashboard');
        return;
      }

      const json = await res.json();
      if (!res.ok || !json.data?.id) {
        setError(json?.error || 'Failed to create notebook.');
        return;
      }

      router.push(`/workspace/${json.data.id}`);
    } catch {
      setError('Failed to create notebook.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingState type="page" message="Loading dashboard..." />;

  return (
    <div className="container-wide" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
      </header>

      {error && (
        <div style={{ padding: '1rem', border: '1px solid var(--ink)', marginBottom: '2rem', backgroundColor: 'var(--paper)', color: 'var(--ink)' }}>
          <strong style={{ fontWeight: 600 }}>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }} className="dashboard-grid-responsive">
        <aside>
          <section className="card card-ruled" style={{ padding: '2rem 1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem', color: 'var(--ink)' }}>Create notebook</h2>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="name" className="eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                <input id="name" className="input" required placeholder="e.g. Data Structures" value={newName} onChange={e => setNewName(e.target.value)} disabled={creating} />
              </div>
              
              <div>
                <label htmlFor="desc" className="eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>Description (optional)</label>
                <input id="desc" className="input" placeholder="e.g. For final exams" value={newDesc} onChange={e => setNewDesc(e.target.value)} disabled={creating} />
              </div>

              <button className="btn" disabled={creating} type="submit" style={{ marginTop: '0.5rem', width: '100%' }}>
                {creating ? 'Creating...' : 'Create notebook'}
              </button>
            </form>
          </section>
        </aside>

        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem', color: 'var(--ink)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--ink-soft)' }}>
            Your Notebooks
          </h2>

          {workspaces.length === 0 ? (
            <EmptyState 
              title="No Notebooks Yet" 
              description="Notebooks are where you organize source materials and concepts for a specific subject." 
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {workspaces.map((ws) => (
                <Link key={ws.id} href={`/workspace/${ws.id}`} style={{ textDecoration: 'none' }}>
                  <article className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--ink-light)', transition: 'border-color 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--ink)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ink-light)')}
                  >
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
          )}
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingState type="page" message="Loading dashboard..." />}>
      <DashboardContent />
    </Suspense>
  );
}
