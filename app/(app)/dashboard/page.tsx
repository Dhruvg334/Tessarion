/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<import('@/types/database').Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const router = useRouter();

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
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError('Workspace name cannot be empty');
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
      
      const json = await res.json();
      
      if (!res.ok) {
        setError(json.error?.message || 'Failed to create workspace. Please try again.');
        return;
      }
      
      router.push(`/workspace/${json.data.id}`);
    } catch (err: unknown) {
      setError('An unexpected error occurred while creating the workspace.');
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
          <p className="muted">Select a workspace or create a new one to start learning.</p>
        </div>
      </div>
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          borderLeft: '4px solid var(--ink)', 
          backgroundColor: 'var(--paper)',
          color: 'var(--ink)',
          marginBottom: '2rem',
          fontWeight: 500,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Create New Workspace Card */}
        <div className="card" style={{ height: '100%', background: 'transparent', border: '1px dashed var(--line-strong)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Create New Notebook</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input 
              className="input" 
              required 
              placeholder="Title" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              disabled={creating}
            />
            <input 
              className="input" 
              placeholder="Description (Optional)" 
              value={newDesc} 
              onChange={e => setNewDesc(e.target.value)} 
              disabled={creating}
            />
            <button className="btn" disabled={creating} type="submit" style={{ alignSelf: 'flex-start' }}>
              {creating ? 'Creating...' : '+ Create'}
            </button>
          </form>
        </div>

        {/* Existing Workspaces */}
        {workspaces.map((ws) => (
          <Link key={ws.id} href={'/workspace/' + ws.id} style={{ display: 'block', textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--foreground)', fontSize: '1.125rem', fontWeight: 600 }}>{ws.name}</h3>
              <p className="muted" style={{ fontSize: '0.875rem', flex: 1 }}>{ws.description || 'No description provided.'}</p>
              
              <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--ink)', fontWeight: 500, display: 'flex', justifyContent: 'flex-end' }}>
                <span>Open notebook →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
