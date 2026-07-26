import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';
import { LogoutButton } from './logout-button';

export function AppHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ink)' }}>
          <TesseractIcon size={24} />
          <span className="handwritten" style={{ fontSize: '1.35rem' }}>Tessarion</span>
        </Link>
        <nav className="site-nav">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/docs" className="nav-link">Documentation</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/demo" className="nav-link">Demo</Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
