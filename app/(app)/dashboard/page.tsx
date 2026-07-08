'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductPanelNav, PanelNavItem } from '@/components/shell/product-panel-nav';
import { LoadingState } from '@/components/shell/loading-state';
import { EmptyState } from '@/components/shell/empty-state';
import { ReviewQueue } from '@/components/review/review-queue';

type Workspace = import('@/types/database').Workspace;

const PANELS: PanelNavItem[] = [
  { id: 'notebooks', label: 'Notebooks' },
  { id: 'learning-flow', label: 'Learning Flow' },
  { id: 'review', label: 'Review Queue' },
  { id: 'status', label: 'System Status' },
  { id: 'guide', label: 'Guide' }
];

function DashboardContent() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [masterySummary, setMasterySummary] = useState<{
    assessedCount: number;
    understoodCount: number;
    needsReviewCount: number;
    misconceptionCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPanel = searchParams.get('panel') || 'notebooks';

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const [wsRes, masteryRes] = await Promise.all([
          fetch('/api/workspaces'),
          fetch('/api/mastery')
        ]);
        
        if (wsRes.status === 401) {
          router.push('/login?next=/dashboard');
          return;
        }

        const wsJson = await wsRes.json();
        if (!wsRes.ok) {
          const message = wsJson?.error?.message || wsJson?.error || 'Failed to load notebooks.';
          setError(typeof message === 'string' ? message : 'Failed to load notebooks.');
          return;
        }

        setWorkspaces(wsJson.data || []);

        if (masteryRes.ok) {
          const masteryJson = await masteryRes.json();
          setMasterySummary(masteryJson.data);
        }
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

      const json = await res.json();
      if (!res.ok || !json.data?.id) {
        const message = json?.error?.message || json?.error || 'Failed to create notebook. Check that Next.js and Supabase are running.';
        setError(typeof message === 'string' ? message : 'Failed to create notebook.');
        return;
      }

      router.push(`/workspace/${json.data.id}`);
    } catch {
      setError('Could not reach the workspace API. Check that Next.js and Supabase are running, then try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingState type="page" message="Loading workspace..." />;

  return (
    <div className="container-wide" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
      </header>

      <ProductPanelNav panels={PANELS} defaultPanel="notebooks" />

      {error && (
        <div style={{ padding: '1rem', border: '1px solid var(--ink)', marginBottom: '2rem', backgroundColor: 'var(--paper)', color: 'var(--ink)' }}>
          <strong style={{ fontWeight: 600 }}>Error:</strong> {error}
        </div>
      )}

      {currentPanel === 'notebooks' && (
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
            {masterySummary && masterySummary.assessedCount > 0 ? (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem', color: 'var(--ink)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--ink-soft)' }}>
                  Learning State
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{masterySummary.understoodCount}</div>
                    <div className="eyebrow">Understood</div>
                  </div>
                  <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{masterySummary.needsReviewCount}</div>
                    <div className="eyebrow">Needs Review</div>
                  </div>
                  <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{masterySummary.misconceptionCount}</div>
                    <div className="eyebrow">Misconceptions</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem', color: 'var(--ink)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--ink-soft)' }}>
                  Learning State
                </h2>
                <EmptyState 
                  title="No Mastery Data Yet" 
                  description="Mastery appears after you complete teach-back sessions on concepts." 
                />
              </div>
            )}

            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem', color: 'var(--ink)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--ink-soft)' }}>
              Existing notebooks ({workspaces.length})
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
                        Open →
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {currentPanel === 'learning-flow' && (
        <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>1. Add Source Material</h2>
            <p className="muted">Upload your reading materials, lecture notes, or syllabus excerpts. Tessarion grounds all feedback strictly within what you provide.</p>
          </div>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>2. Extract Concepts</h2>
            <p className="muted">The system analyzes your text and extracts a semantic graph of concepts and their prerequisites. This builds a visual mental model of the subject.</p>
          </div>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>3. Teach-Back</h2>
            <p className="muted">Select a concept and explain it in your own words. You will receive immediate feedback identifying gaps, missing prerequisites, or unsupported claims.</p>
          </div>
        </div>
      )}

      {currentPanel === 'review' && (
        <div style={{ maxWidth: '800px' }}>
          <ReviewQueue />
        </div>
      )}

      {currentPanel === 'status' && (
        <div className="card" style={{ padding: '2rem', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>System & Trust Status</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--ink-soft)' }}>
            <li><strong>Grounding:</strong> All feedback is strictly source-grounded. No external information is hallucinated into your curriculum.</li>
            <li><strong>CI Environment:</strong> If running in CI, evaluations run purely locally/offline. External API providers are blocked to prevent costs.</li>
            <li><strong>Teach-Back Limit:</strong> The teach-back agent currently asks one high-value Socratic follow-up question per explanation.</li>
          </ul>
        </div>
      )}

      {currentPanel === 'guide' && (
        <div className="card" style={{ padding: '2rem', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>First Use Checklist</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--ink-soft)' }}>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid var(--ink)', borderRadius: '50%' }} />
              Create your first notebook
            </li>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid var(--ink)', borderRadius: '50%' }} />
              Add source material
            </li>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid var(--ink)', borderRadius: '50%' }} />
              Extract concepts
            </li>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid var(--ink)', borderRadius: '50%' }} />
              Complete a teach-back session
            </li>
          </ul>
        </div>
      )}
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
