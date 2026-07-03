/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<import('@/types/database').Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const load = async () => {
    try {
      const res = await fetch('/api/workspaces');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      setWorkspaces(json.data || []);
    } catch {
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      if (res.ok) {
        setNewName('');
        setNewDesc('');
        load();
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem 2rem' }}>Loading workspaces...</div>;

  return (
    <div className="container" style={{ padding: '0 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div>
          <h1 className="title" style={{ marginBottom: '0.25rem' }}>Your Notebooks</h1>
          <p className="muted">Create a new workspace to start learning.</p>
        </div>
        
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input className="input" required placeholder="Workspace Name" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '200px' }} />
          <input className="input" placeholder="Description (Optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ width: '250px' }} />
          <button className="btn" disabled={creating} type="submit">
            + Create
          </button>
        </form>
      </div>
      
      {error && <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</p>}
      
      {workspaces.length === 0 ? (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '4rem 2rem', background: 'transparent', border: '1px dashed var(--border)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Workspaces Yet</h3>
          <p className="muted">Use the form above to create your first learning workspace.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {workspaces.map((ws) => (
            <Link key={ws.id} href={'/workspace/' + ws.id} style={{ display: 'block', textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%', transition: 'transform 0.1s', cursor: 'pointer' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--foreground)', fontSize: '1.125rem', fontWeight: 600 }}>{ws.name}</h3>
                <p className="muted" style={{ fontSize: '0.875rem' }}>{ws.description || 'No description provided.'}</p>
                
                <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', justifyContent: 'flex-end' }}>
                  <span>Open workspace →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
