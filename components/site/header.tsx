import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

const primaryLinks = [
  { href: '/how-it-works', label: 'System' },
  { href: '/about', label: 'About' },
  { href: '/demo', label: 'Demo' },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-link" aria-label="Tessarion home">
          <span className="brand-mark" aria-hidden="true"><TesseractIcon size={24} /></span>
          <span className="brand-wordmark handwritten">Tessarion</span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          <div className="site-nav-links">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">{link.label}</Link>
            ))}
          </div>
          <div className="site-nav-actions">
            <Link href="/login" className="nav-link nav-link-quiet">Sign in</Link>
            <Link href="/signup" className="btn btn-compact">Open workspace</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
