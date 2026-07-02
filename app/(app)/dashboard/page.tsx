export default function DashboardPage() {
  return (
    <div className="container">
      <h1 className="title">Dashboard</h1>
      <p className="muted">Your active workspaces and learning progress.</p>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Scaffolded UI</h3>
        <p className="muted">Workspaces will be listed here.</p>
      </div>
    </div>
  );
}