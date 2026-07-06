'use client';

import React, { useState } from 'react';
import { SourceDocument } from '@/types/database';
import { LoadingState } from '@/components/shell/loading-state';

interface DocumentListProps {
  documents: SourceDocument[];
  workspaceId: string;
}

export function DocumentList({ documents, workspaceId }: DocumentListProps) {
  const [extracting, setExtracting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async (docId: string) => {
    setExtracting(docId);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/documents/${docId}/concepts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'local' })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const json = await res.json();
        setError(json.error?.message || 'Extraction failed');
      }
    } catch (e) {
      setError('Failed to reach the extraction API');
      console.error(e);
    } finally {
      setExtracting(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="card" style={{ marginTop: '1rem', textAlign: 'center', background: 'transparent', border: '1px dashed var(--border)', padding: '2rem 1rem' }}>
        <p className="muted" style={{ fontSize: '0.875rem' }}>No documents yet. Add materials to start building context.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--paper)', border: '1px solid var(--ink)', color: 'var(--ink)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
      {documents.map(doc => (
        <div key={doc.id} className="card" style={{ padding: '1rem' }}>
          <div className="flex justify-between items-start">
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 500 }}>{doc.file_name}</h4>
              <p className="muted" style={{ margin: 0, fontSize: '0.75rem' }}>
                Status: <span style={{ textTransform: 'capitalize' }}>{doc.processing_status}</span> • Chunks: {doc.chunk_count}
              </p>
            </div>
            {doc.chunk_count > 0 && (
              <button 
                onClick={() => handleExtract(doc.id)}
                disabled={extracting === doc.id}
                className="btn btn-secondary text-xs px-2 py-1"
                style={{ width: '160px', textAlign: 'center' }}
              >
                {extracting === doc.id ? (
                  <LoadingState type="button" message="Building the graph..." />
                ) : (
                  'Extract Concepts'
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
