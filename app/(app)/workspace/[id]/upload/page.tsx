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
    <div className="container" style={{ padding: '0 2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href={`/workspace/${workspaceId}`} className="muted" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem' }}>
          ← Back to Workspace
        </Link>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="title" style={{ marginBottom: '0.25rem' }}>Add Materials</h1>
        <p className="muted">Upload your study materials, lecture notes, or textbook excerpts.</p>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Paste Text Form */}
        <div className="card" style={{ flex: '1 1 400px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Paste Text</h3>
          {error && <p className="notice" style={{ marginBottom: '1rem' }}><strong>Error:</strong> {error}</p>}
          {success && (
            <div className="notice" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              <strong>Success:</strong> Processed into {chunkCount} context chunks.
              <div className="mt-3">
                <Link href={`/workspace/${workspaceId}`} className="btn font-handwritten" style={{ padding: '0.3rem 0.75rem', fontSize: '1rem' }}>
                  Return to workspace to extract concepts
                </Link>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--foreground)' }}>Document Title</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Cellular Respiration Chapter 9"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--foreground)' }}>Content</label>
              <textarea
                className="input"
                placeholder="Paste the text content of your material here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={15}
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
            </div>
            
            <button className="btn" disabled={loading} type="submit" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Processing...' : 'Process Text'}
            </button>
          </form>
        </div>

        {/* File Upload Placeholder */}
        <div className="card" style={{ flex: '1 1 300px', opacity: 0.7, height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>File Upload</h3>
          <p className="muted" style={{ fontSize: '0.875rem' }}>Coming next. PDF, DOCX, and TXT files will be securely uploaded to Supabase Storage and automatically parsed.</p>
          <div style={{ border: '2px dashed var(--border)', borderRadius: '6px', padding: '3rem', textAlign: 'center', marginTop: '1.5rem', background: 'var(--background)' }}>
            <p className="muted" style={{ fontSize: '0.875rem' }}>Drag and drop files here (Disabled)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
