import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';
import { LogoutButton } from './logout-button';

export function AppHeader() {
  return (
    <header style={{ 
      borderBottom: '1px solid var(--border)',
      background: 'transparent',
      padding: '1rem 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ink)' }}>
          <TesseractIcon size={24} />
          <span className="handwritten" style={{ fontSize: '1.25rem', marginBottom: 0 }}>Tessarion</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: 'var(--ink-soft)', fontWeight: 500, fontSize: '0.875rem' }}>Dashboard</Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
