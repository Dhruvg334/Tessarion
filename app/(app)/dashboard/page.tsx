"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Workspace = import('@/types/database').Workspace;

type ApiError = {
  error?: {
    message?: string;
    code?: string;
  };
};

type WorkspacesResponse = {
  data?: Workspace[];
} & ApiError;

type WorkspaceCreateResponse = {
  data?: Workspace;
} & ApiError;

function getSafeError(json: ApiError, fallback: string) {
  return json.error?.message || fallback;
}

export default function DashboardPage() {
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
        const res = await fetch('/api/workspaces');
        if (res.status === 401) {
          router.push('/login?next=/dashboard');
          return;
        }

        const json = (await res.json()) as WorkspacesResponse;
        if (!res.ok) {
          setError(getSafeError(json, 'Failed to load notebooks.'));
          return;
        }

        setWorkspaces(json.data || []);
      } catch {
        setError('Could not reach the workspace API. Confirm the app server is running and try again.');
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

      const json = (await res.json()) as WorkspaceCreateResponse;
      if (!res.ok || !json.data?.id) {
        setError(getSafeError(json, 'Failed to create notebook. Check Supabase is running and your local env values are correct.'));
        return;
      }

      router.push(`/workspace/${json.data.id}`);
    } catch {
      setError('Could not reach the workspace API. Check that Next.js and Supabase are running, then try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '5rem 2rem' }}>Loading notebooks...</div>;

  return (
    <main className="container-wide" style={{ paddingTop: '4rem' }}>
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: '0.8rem' }}>Dashboard</p>
          <h1 className="title" style={{ marginBottom: '0.5rem' }}>Your notebooks</h1>
          <p className="subtitle">Create a study workspace, add source material, extract concepts, and teach them back.</p>
        </div>
        <p className="annotation" style={{ maxWidth: '260px', color: 'var(--ink-soft)' }}>one notebook per subject keeps the graph clean</p>
      </section>

      {error && <div className="notice" style={{ marginBottom: '2rem' }}><strong>Error:</strong> {error}</div>}

      <div className="dashboard-grid">
        <section className="card card-ruled" style={{ minHeight: '360px' }}>
          <p className="eyebrow" style={{ marginBottom: '1rem' }}>New notebook</p>
          <h2 style={{ fontSize: '1.75rem', lineHeight: 1.1, letterSpacing: '-0.035em', marginBottom: '1rem' }}>Start a focused workspace</h2>
          <p className="muted" style={{ marginBottom: '1.75rem' }}>Use a clear subject name. Tessarion will organize documents and concepts inside this notebook.</p>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <input className="input" required placeholder="Notebook title, e.g. DSA" value={newName} onChange={e => setNewName(e.target.value)} disabled={creating} />
            <input className="input" placeholder="Short purpose, e.g. placement preparation" value={newDesc} onChange={e => setNewDesc(e.target.value)} disabled={creating} />
            <button className="btn" disabled={creating} type="submit" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              {creating ? 'Creating notebook...' : 'Create notebook'}
            </button>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Existing notebooks</h2>
            <span className="muted" style={{ fontSize: '0.9rem' }}>{workspaces.length} total</span>
          </div>

          {workspaces.length === 0 ? (
            <div className="card" style={{ minHeight: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p className="annotation" style={{ marginBottom: '0.5rem' }}>No notebooks yet.</p>
              <p className="muted">Create your first notebook and Tessarion will open it immediately.</p>
            </div>
          ) : (
            <div className="workspace-grid">
              {workspaces.map((ws) => (
                <Link key={ws.id} href={`/workspace/${ws.id}`} className="brand-link" style={{ display: 'block' }}>
                  <article className="card workspace-card">
                    <div>
                      <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Notebook</p>
                      <h3 style={{ marginBottom: '0.5rem', color: 'var(--ink)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>{ws.name}</h3>
                      <p className="muted" style={{ fontSize: '0.95rem' }}>{ws.description || 'No description provided.'}</p>
                    </div>
                    <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 700 }}>
                      Open notebook →
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
