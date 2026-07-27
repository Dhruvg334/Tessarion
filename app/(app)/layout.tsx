import { SiteHeader } from '@/components/site/header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-root">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="site-main app-main">{children}</main>
    </div>
  );
}
