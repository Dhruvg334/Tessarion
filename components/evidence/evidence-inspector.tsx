'use client';

import { useState } from 'react';

interface EvidenceChunk {
  id: string;
  sourceDocumentId: string;
  documentName: string;
  chunkIndex: number;
  sectionHint: string | null;
  tokenCount: number | null;
  content: string;
}

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    return payload.error || payload.message || 'Evidence could not be loaded.';
  } catch {
    return 'Evidence could not be loaded.';
  }
}

export function EvidenceInspector({ workspaceId, chunkIds, label = 'Inspect evidence' }: { workspaceId: string; chunkIds: string[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chunks, setChunks] = useState<EvidenceChunk[]>([]);
  const uniqueIds = [...new Set(chunkIds)].slice(0, 12);

  const load = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (chunks.length > 0 || uniqueIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/evidence?ids=${encodeURIComponent(uniqueIds.join(','))}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(await readError(response));
      const payload = (await response.json()) as { data?: EvidenceChunk[] };
      setChunks(payload.data ?? []);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Evidence could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  if (uniqueIds.length === 0) return null;

  return (
    <div className="evidence-inspector">
      <button type="button" className="evidence-inspector-trigger" onClick={() => void load()} aria-expanded={open}>
        {open ? 'Hide evidence' : label}
      </button>
      {open ? (
        <div className="evidence-inspector-panel">
          <div className="evidence-inspector-head"><div><span>Evidence inspector</span><strong>{uniqueIds.length} linked source reference{uniqueIds.length === 1 ? '' : 's'}</strong></div><button type="button" onClick={() => setOpen(false)} aria-label="Close evidence inspector">×</button></div>
          {loading ? <p className="evidence-inspector-state">Loading source excerpts…</p> : null}
          {error ? <div className="evidence-inspector-error" role="alert"><strong>Evidence unavailable</strong><span>{error}</span></div> : null}
          {!loading && !error && chunks.length === 0 ? <p className="evidence-inspector-state">No accessible source excerpts were returned.</p> : null}
          {chunks.map((chunk) => (
            <article key={chunk.id} className="evidence-chunk-card">
              <header><div><span>{chunk.documentName}</span><strong>{chunk.sectionHint || `Chunk ${chunk.chunkIndex + 1}`}</strong></div><code>{chunk.id.slice(0, 8)}</code></header>
              <p>{chunk.content}</p>
              <footer><span>Chunk {chunk.chunkIndex + 1}</span>{chunk.tokenCount ? <span>{chunk.tokenCount} tokens</span> : null}</footer>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
