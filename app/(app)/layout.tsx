import { AppHeader } from '@/components/site/app-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-root">
      <AppHeader />
      <main id="main-content" tabIndex={-1} className="site-main app-main">{children}</main>
    </div>
  );
}
