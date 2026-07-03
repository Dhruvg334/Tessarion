export function SiteFooter() {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--border)',
      background: 'transparent',
      padding: '2rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem', padding: '0 2rem' }}>
        <p>&copy; {new Date().getFullYear()} Tessarion. A learning workspace where students understand by teaching.</p>
      </div>
    </footer>
  );
}
