import { SiteHeader } from '@/components/site/header';

/** @deprecated Use SiteHeader directly so public and authenticated routes share one auth-aware shell. */
export async function AppHeader() {
  return <SiteHeader />;
}
