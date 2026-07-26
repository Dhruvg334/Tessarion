import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

export function SiteFooter() {
  return (
    <footer className="site-footer site-footer-wood">
      <div className="site-footer-inner">
        <div className="site-footer-brand"><TesseractIcon size={20} /><strong>Tessarion</strong><span>Evidence-linked learning through explanation.</span></div>
        <nav aria-label="Footer navigation"><Link href="/docs">Documentation</Link><Link href="/about/learning-methods">Learning methods</Link><Link href="/demo">Demo</Link></nav>
        <span>© {new Date().getFullYear()} Dhruv Gupta</span>
      </div>
    </footer>
  );
}
