export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container">
      <h1 className="title">Workspace: {id}</h1>
      <p className="muted">Knowledge graph and mastery overview.</p>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Scaffolded Graph View</h3>
        <p className="muted">Cytoscape visualization coming next.</p>
      </div>
    </div>
  );
}