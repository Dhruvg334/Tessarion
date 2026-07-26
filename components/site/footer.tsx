export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <span>© {new Date().getFullYear()} Tessarion</span>
        <span>Evidence-linked learning through explanation.</span>
      </div>
    </footer>
  );
}
