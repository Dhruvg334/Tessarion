'use client';

import Link from 'next/link';

interface NextActionPanelProps {
  workspaceId: string;
  hasDocuments: boolean;
  hasConcepts: boolean;
}

export function NextActionPanel({ workspaceId, hasDocuments, hasConcepts }: NextActionPanelProps) {
  if (!hasDocuments) {
    return (
      <div className="card card-ruled" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--ink)' }}>Next Action</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>Add source materials to begin your learning journey.</p>
        <Link href={`/workspace/${workspaceId}/upload`} className="btn" style={{ display: 'block', textAlign: 'center' }}>Add Source Material</Link>
      </div>
    );
  }

  if (!hasConcepts) {
    return (
      <div className="card card-ruled" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--ink)' }}>Next Action</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>Extract concepts from your documents to build a knowledge graph.</p>
        <Link href={`/workspace/${workspaceId}?panel=graph`} className="btn" style={{ display: 'block', textAlign: 'center' }}>Go to Graph</Link>
      </div>
    );
  }

  return (
    <div className="card card-ruled" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--ink)' }}>Next Action</h2>
      <p className="muted" style={{ marginBottom: '1rem' }}>Your workspace is ready. Select a concept in the Knowledge Graph to start a Teach-Back, or check your Review Queue.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link href={`/workspace/${workspaceId}?panel=teach-back`} className="btn" style={{ display: 'block', textAlign: 'center' }}>Start Teach-Back</Link>
        <Link href={`/workspace/${workspaceId}?panel=review`} className="btn btn-secondary" style={{ display: 'block', textAlign: 'center' }}>Check Reviews</Link>
      </div>
    </div>
  );
}
