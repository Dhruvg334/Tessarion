export default async function ReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container">
      <h1 className="title">Spaced Repetition Reviews</h1>
      <p className="muted">Workspace: {id}</p>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <p className="muted">Pending concept reviews will appear here.</p>
      </div>
    </div>
  );
}