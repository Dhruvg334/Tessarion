import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="handwritten site-footer-brand">Tessarion</p>
          <p className="site-footer-note">Evidence-linked learning through explanation, retrieval, and review.</p>
        </div>
        <nav className="site-footer-links" aria-label="Footer navigation">
          <Link href="/how-it-works">System</Link>
          <Link href="/about">About</Link>
          <Link href="/demo">Demo</Link>
          <Link href="/login">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
