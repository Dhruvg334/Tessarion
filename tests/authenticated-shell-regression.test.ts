import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path: string) { return readFileSync(path, 'utf8'); }

describe('authenticated shell regressions', () => {
  it('renders public navigation from the server auth cookie', () => {
    const header = read('components/site/header.tsx');
    expect(header).toContain('createServerSupabaseClient');
    expect(header).toContain('auth.getUser');
    expect(header).toContain('<ProfileMenu');
    expect(header).toContain('href="/dashboard"');
  });

  it('uses the same header for authenticated and public routes', () => {
    const appLayout = read('app/(app)/layout.tsx');
    expect(appLayout).toContain("from '@/components/site/header'");
    expect(appLayout).toContain('<SiteHeader />');
    expect(appLayout).not.toContain('AppHeader');
  });

  it('protects profile routes and exposes account settings', () => {
    const proxy = read('proxy.ts');
    const profile = read('app/(app)/profile/page.tsx');
    expect(proxy).toContain("'/profile'");
    expect(proxy).toContain('_next/static');
    expect(proxy).toContain('auth.getUser');
    expect(profile).toContain('ProfileSettingsForm');
    expect(profile).toContain("redirect('/login?next=/profile')");
  });

  it('keeps report icons out of the relationship canvas selector', () => {
    const css = read('app/globals.css');
    expect(css).not.toContain('.knowledge-report-graph svg { position: absolute');
    expect(css).toContain('.knowledge-report-graph > svg');
    expect(css).toContain('.report-graph-heading > svg');
  });

  it('keeps the dashboard compact and modal-driven', () => {
    const dashboard = read('app/(app)/dashboard/page.tsx');
    expect(dashboard).toContain('CreateWorkspaceDialog');
    expect(dashboard).toContain('dashboard-quick-strip');
    expect(dashboard).not.toContain('dashboard-side-rail');
  });
});
