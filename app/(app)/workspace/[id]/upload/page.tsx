"use client";
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workspaceId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: title, content }),
      });
      
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to upload');
      }

      setSuccess(true);
      setChunkCount(json.data.chunk_count);
      setTitle('');
      setContent('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <Link href={`/workspace/${workspaceId}`} className="muted">← Back to Workspace</Link>
      </div>
      <h1 className="title">Upload Materials</h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {/* Paste Text Form */}
        <div className="card" style={{ flex: 1 }}>
          <h3>Paste Text</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && (
            <div style={{ padding: '1rem', background: 'var(--accent)', color: '#fff', borderRadius: '4px', marginBottom: '1rem' }}>
              Successfully processed into {chunkCount} chunks.
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Document Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
            <textarea
              placeholder="Paste content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={15}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', resize: 'vertical' }}
            />
            <button disabled={loading} type="submit" style={{ padding: '0.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Processing...' : 'Process Text'}
            </button>
          </form>
        </div>

        {/* File Upload Placeholder */}
        <div className="card" style={{ flex: 1, opacity: 0.7 }}>
          <h3>File Upload</h3>
          <p className="muted" style={{ marginTop: '1rem' }}>Coming next. PDF, DOCX, and TXT files will be securely uploaded to Supabase Storage and parsed.</p>
          <div style={{ border: '2px dashed var(--border)', borderRadius: '4px', padding: '3rem', textAlign: 'center', marginTop: '1rem' }}>
            <p className="muted">Drag and drop files here (Disabled)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
