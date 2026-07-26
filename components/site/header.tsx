import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner site-header-wide">
        <Link href="/" className="brand-link" aria-label="Tessarion home">
          <TesseractIcon size={24} />
          <span className="brand-word">Tessarion</span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/docs" className="nav-link">Documentation</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/demo" className="nav-link">Demo</Link>
          <Link href="/login" className="nav-link">Sign in</Link>
          <Link href="/signup" className="btn btn-header">Start learning</Link>
        </nav>
      </div>
    </header>
  );
}
