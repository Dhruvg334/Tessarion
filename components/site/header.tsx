import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ink)' }}>
          <TesseractIcon size={28} />
          <span className="handwritten" style={{ fontSize: '1.55rem' }}>Tessarion</span>
        </Link>
        <nav className="site-nav">
          <Link href="/how-it-works" className="nav-link">How it works</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/demo" className="nav-link">Demo</Link>
          <Link href="/login" className="nav-link">Sign in</Link>
          <Link href="/signup" className="btn" style={{ padding: '0.52rem 1rem', minHeight: 36 }}>Start learning</Link>
        </nav>
      </div>
    </header>
  );
}
