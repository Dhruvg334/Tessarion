import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path: string) {
  return readFileSync(path, 'utf8');
}

describe('product shell accessibility regressions', () => {
  it('provides a keyboard skip link and matching main landmark', () => {
    expect(read('app/layout.tsx')).toContain('href="#main-content"');
    expect(read('app/(app)/layout.tsx')).toContain('id="main-content"');
    expect(read('components/site/site-shell.tsx')).toContain('id="main-content"');
  });

  it('provides route-level loading and recovery states for workspaces', () => {
    expect(read('app/(app)/workspace/[id]/loading.tsx')).toContain('Loading notebook');
    expect(read('app/(app)/workspace/[id]/error.tsx')).toContain('RouteErrorState');
  });

  it('keeps public shell rendering independent from Supabase', () => {
    expect(read('components/site/site-shell.tsx')).not.toMatch(/supabase|auth\.getUser/i);
    expect(read('app/(marketing)/page.tsx')).not.toMatch(/supabase|auth\.getUser/i);
  });
});
