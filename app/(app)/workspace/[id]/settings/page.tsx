export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container">
      <h1 className="title">Workspace Settings</h1>
      <p className="muted">Workspace: {id}</p>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <p className="muted">Configuration options coming next.</p>
      </div>
    </div>
  );
}