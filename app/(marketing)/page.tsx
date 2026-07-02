export default function MarketingPage() {
  return (
    <div className="flex-center">
      <div className="card" style={{ maxWidth: 600, textAlign: 'center' }}>
        <h1 className="title">Tessarion</h1>
        <p className="muted" style={{ marginBottom: '2rem' }}>Learn by teaching. An AI-powered deep learning workspace.</p>
        <p>
          <a href="/login" style={{ marginRight: '1rem' }}>Log In</a>
          <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}