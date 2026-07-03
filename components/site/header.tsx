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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ink)' }}>
          <TesseractIcon size={28} />
          <span className="handwritten" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Tessarion</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/how-it-works" style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>How it works</Link>
          <Link href="/about" style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>About</Link>
          <Link href="/demo" style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>Demo</Link>
          <Link href="/login" style={{ color: 'var(--ink)', fontWeight: 500 }}>Login</Link>
          <Link href="/signup" className="btn" style={{ padding: '0.5rem 1rem' }}>Sign up</Link>
        </nav>
      </div>
    </header>
  );
}
