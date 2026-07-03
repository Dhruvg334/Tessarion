import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

export function SiteHeader() {
  return (
    <header style={{ 
      borderBottom: '1px solid var(--border)',
      background: 'transparent',
      padding: '1rem 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--foreground)' }}>
          <TesseractIcon size={28} />
          <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>Tessarion</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/demo" style={{ color: 'var(--muted)', fontWeight: 500 }}>Demo</Link>
          <Link href="/login" style={{ color: 'var(--muted)', fontWeight: 500 }}>Login</Link>
          <Link href="/signup" className="btn" style={{ padding: '0.5rem 1rem' }}>Sign up</Link>
        </nav>
      </div>
    </header>
  );
}
