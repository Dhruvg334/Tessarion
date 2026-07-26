import { AppHeader } from '@/components/site/app-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-root">
      <AppHeader />
      <main className="site-main app-main">{children}</main>
    </div>
  );
}
