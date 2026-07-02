export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container">
      <h1 className="title">Audit Log</h1>
      <p className="muted">Workspace: {id} — Transparent AI reasoning</p>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <p className="muted">Logs of AI prompts, context, and responses.</p>
      </div>
    </div>
  );
}