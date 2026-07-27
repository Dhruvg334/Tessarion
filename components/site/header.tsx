import Link from 'next/link';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProfileMenu } from '@/components/site/profile-menu';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

interface HeaderIdentity {
  email: string;
  displayName: string | null;
}

async function loadHeaderIdentity(): Promise<HeaderIdentity | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle();

    return { email: user.email, displayName: profile?.display_name ?? null };
  } catch {
    return null;
  }
}

export async function SiteHeader() {
  const identity = await loadHeaderIdentity();

  return (
    <header className="site-header">
      <div className="site-header-inner site-header-wide">
        <Link href="/" className="brand-link" aria-label="Tessarion home">
          <TesseractIcon size={24} />
          <span className="brand-word">Tessarion</span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/docs" className="nav-link">Documentation</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/demo" className="nav-link">Demo</Link>
          {identity ? (
            <>
              <Link href="/dashboard" className="btn btn-header">Dashboard</Link>
              <ProfileMenu email={identity.email} displayName={identity.displayName} />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Sign in</Link>
              <Link href="/signup" className="btn btn-header">Start learning</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
