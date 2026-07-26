'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/shell/loading-state';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workspaceId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: title.trim(), content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || payload?.error || 'The source could not be processed.');
      setSuccess(true);
      setChunkCount(payload.data.chunk_count);
      setTitle('');
      setContent('');
      router.refresh();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'The source could not be processed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-page workspace-subpage">
      <div className="container-wide">
        <div className="workspace-breadcrumb"><Link href="/dashboard">Dashboard</Link><span>/</span><Link href={`/workspace/${workspaceId}?panel=sources`}>Notebook</Link><span>/</span><span>Add source</span></div>
        <WorkspaceShell workspaceId={workspaceId} workspaceName="Current notebook">
          <header className="workspace-subpage-header"><div><p className="eyebrow">Evidence base</p><h1>Add source material</h1><p>Paste a focused passage or set of notes. Tessarion will split it into traceable chunks before any concept analysis begins.</p></div></header>

          {error ? <div className="notice" role="alert"><strong>Source not added.</strong> {error}</div> : null}
          {success ? <div className="notice" role="status"><strong>Source processed.</strong> Created {chunkCount} evidence chunks. <Link href={`/workspace/${workspaceId}?panel=sources`}>Return to sources</Link>.</div> : null}

          <div className="source-entry-layout">
            <form className="source-entry-form" onSubmit={handleSubmit}>
              <div className="form-field"><label htmlFor="source-title">Document title</label><input id="source-title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Cellular respiration — Chapter 9" required disabled={loading} /></div>
              <div className="form-field"><label htmlFor="source-content">Source text</label><textarea id="source-content" className="input source-textarea" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Paste the material exactly as you want it used as evidence…" required rows={18} disabled={loading} /></div>
              <div className="source-entry-actions"><button className="btn" disabled={loading} type="submit">{loading ? <LoadingState type="button" message="Processing…" /> : 'Process source'}</button><Link href={`/workspace/${workspaceId}?panel=sources`} className="btn btn-secondary">Cancel</Link></div>
            </form>
            <aside className="source-entry-guidance"><p className="eyebrow">Good source material</p><h2>Keep the evidence bounded.</h2><ul><li>Use one topic or chapter section at a time.</li><li>Preserve definitions and prerequisite explanations.</li><li>Remove unrelated navigation, footers, and duplicate text.</li></ul><p>File upload remains intentionally disabled until parsing and storage guardrails are complete.</p></aside>
          </div>
        </WorkspaceShell>
      </div>
    </div>
  );
}
