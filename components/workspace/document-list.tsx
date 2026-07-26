'use client';

import { useMemo, useState } from 'react';
import type { SourceDocument } from '@/types/database';

interface DocumentListProps {
  documents: SourceDocument[];
  workspaceId: string;
}

type DocumentAction = 'extract' | 'embed';

function formatBytes(value: number | null) {
  if (!value || value <= 0) return 'Text source';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

function getCompletedSteps(steps: Record<string, unknown>) {
  return Object.entries(steps)
    .filter(([, value]) => value === true || value === 'completed' || value === 'ready')
    .map(([key]) => key.replaceAll('_', ' '));
}

export function DocumentList({ documents, workspaceId }: DocumentListProps) {
  const [running, setRunning] = useState<{ id: string; action: DocumentAction } | null>(null);
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const orderedDocuments = useMemo(
    () => [...documents].sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()),
    [documents],
  );

  async function runAction(documentId: string, action: DocumentAction) {
    setRunning({ id: documentId, action });
    setMessage(null);

    const endpoint = action === 'extract'
      ? `/api/workspaces/${workspaceId}/documents/${documentId}/concepts`
      : `/api/workspaces/${workspaceId}/documents/${documentId}/embed`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'extract' ? { provider: 'local' } : {}),
      });
      const body = response.status === 204 ? null : await response.json().catch(() => null);
      if (!response.ok) {
        const apiMessage = body?.error?.message ?? body?.error;
        throw new Error(typeof apiMessage === 'string' ? apiMessage : `Could not ${action} this source.`);
      }

      setMessage({
        tone: 'success',
        text: action === 'extract' ? 'Concept extraction completed.' : 'Retrieval index updated.',
      });
      window.location.reload();
    } catch (error: unknown) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'The source action failed.' });
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="source-library">
      {message ? (
        <div className={`source-library-message ${message.tone}`} role="status" aria-live="polite">
          {message.text}
        </div>
      ) : null}

      <div className="source-library-list">
        {orderedDocuments.map((document, index) => {
          const completedSteps = getCompletedSteps(document.processing_steps ?? {});
          const isBusy = running?.id === document.id;
          const canProcess = document.chunk_count > 0 && document.processing_status !== 'processing';

          return (
            <article className="source-record" key={document.id}>
              <div className="source-record-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
              <div className="source-record-body">
                <div className="source-record-heading">
                  <div>
                    <div className="source-record-title-row">
                      <h3>{document.file_name || 'Untitled source'}</h3>
                      <span className={`source-status source-status-${document.processing_status || 'pending'}`}>
                        {(document.processing_status || 'pending').replaceAll('_', ' ')}
                      </span>
                    </div>
                    <p>{document.input_type === 'paste' ? 'Pasted text' : document.file_type || 'Uploaded source'} · {formatBytes(document.file_size)} · added {formatDate(document.uploaded_at)}</p>
                  </div>
                  <div className="source-record-actions">
                    <button
                      className="btn btn-secondary source-action"
                      type="button"
                      disabled={!canProcess || isBusy}
                      onClick={() => runAction(document.id, 'embed')}
                    >
                      {running?.id === document.id && running.action === 'embed' ? 'Indexing…' : 'Update retrieval'}
                    </button>
                    <button
                      className="btn source-action"
                      type="button"
                      disabled={!canProcess || isBusy}
                      onClick={() => runAction(document.id, 'extract')}
                    >
                      {running?.id === document.id && running.action === 'extract' ? 'Extracting…' : 'Build concepts'}
                    </button>
                  </div>
                </div>

                <dl className="source-record-facts">
                  <div><dt>Chunks</dt><dd>{document.chunk_count}</dd></div>
                  <div><dt>Processed</dt><dd>{document.processed_at ? formatDate(document.processed_at) : 'Not yet'}</dd></div>
                  <div><dt>Pipeline</dt><dd>{completedSteps.length ? completedSteps.slice(0, 3).join(', ') : 'Awaiting processing'}</dd></div>
                </dl>

                {document.error_message ? (
                  <div className="source-record-error"><strong>Processing note</strong><span>{document.error_message}</span></div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
