export default async function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container">
      <h1 className="title">Upload Materials</h1>
      <p className="muted">Workspace: {id}</p>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <p className="muted">File upload and parsing logic (Coming next)</p>
      </div>
    </div>
  );
}