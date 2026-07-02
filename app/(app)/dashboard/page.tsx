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

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h1 className="title">Dashboard</h1>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem' }}>
          <input required placeholder="Workspace Name" value={newName} onChange={e => setNewName(e.target.value)} style={{ padding: '0.5rem' }} />
          <input placeholder="Description (Optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ padding: '0.5rem' }} />
          <button disabled={creating} type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            + Create
          </button>
        </form>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {workspaces.length === 0 ? (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>No Workspaces Yet</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          {workspaces.map((ws) => (
            <Link key={ws.id} href={'/workspace/' + ws.id}>
              <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>{ws.name}</h3>
                <p className="muted">{ws.description || 'No description provided.'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
