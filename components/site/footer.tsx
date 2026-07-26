import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

const footerLinks = [
  { href: '/docs', label: 'Documentation' },
  { href: '/about', label: 'About' },
  { href: '/about/learning-methods', label: 'Learning methods' },
  { href: '/demo', label: 'Demo' },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer site-footer-wood">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-footer-mark">
            <TesseractIcon size={22} />
            <strong>Tessarion</strong>
          </div>
          <p>Evidence-linked learning through explanation.</p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer navigation">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>

        <div className="site-footer-meta">
          <span>Open-source learning intelligence</span>
          <span>© {new Date().getFullYear()} Dhruv Gupta</span>
        </div>
      </div>
    </footer>
  );
}
