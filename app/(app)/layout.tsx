import { AppHeader } from '@/components/site/app-header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <main style={{ flex: 1, padding: '2rem 0' }}>{children}</main>
    </div>
  );
}
