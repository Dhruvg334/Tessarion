export default async function SessionPage({ params }: { params: Promise<{ id: string, sessionId: string }> }) {
  const { id, sessionId } = await params;
  return (
    <div className="container">
      <h1 className="title">Active Session: {sessionId}</h1>
      <p className="muted">Workspace: {id} — Socratic Learning Mode</p>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <p className="muted">Teach-back interface and chat coming next.</p>
      </div>
    </div>
  );
}