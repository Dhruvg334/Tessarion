'use client';

import React, { useState } from 'react';
import { SourceDocument } from '@/types/database';
import { ConceptExtractionResult } from '@/lib/ai/types';

interface DocumentListProps {
  documents: SourceDocument[];
  workspaceId: string;
}

export function DocumentList({ documents, workspaceId }: DocumentListProps) {
  const [extracting, setExtracting] = useState<string | null>(null);

  const handleExtract = async (docId: string) => {
    setExtracting(docId);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/documents/${docId}/concepts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'local' })
      });
      if (res.ok) {
        // Just reload the page to refresh the graph for now
        window.location.reload();
      }
    } catch (e) {
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
              >
                {extracting === doc.id ? 'Extracting...' : 'Extract Concepts'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
