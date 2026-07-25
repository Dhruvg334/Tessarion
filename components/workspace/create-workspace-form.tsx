'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateWorkspaceForm() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const router = useRouter();

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
        setCreating(false);
        return;
      }

      router.push(`/workspace/${json.data.id}`);
    } catch {
      setError('Failed to create notebook.');
      setCreating(false);
    }
  };

  return (
    <section className="card card-ruled" style={{ padding: '2rem 1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem', color: 'var(--ink)' }}>Create notebook</h2>
      
      {error && (
        <div style={{ padding: '0.75rem', border: '1px solid var(--ink)', marginBottom: '1rem', backgroundColor: 'var(--paper)', color: 'var(--ink)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

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
  );
}
