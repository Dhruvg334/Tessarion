import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path: string) { return readFileSync(path, 'utf8'); }

describe('public experience regressions', () => {
  it('keeps a single documentation navigation layer', () => {
    const shell = read('components/docs/docs-shell.tsx');
    expect(shell).not.toContain('docs-topbar');
    expect(shell).toContain('docs-sidebar');
  });

  it('ships interactive diagram controls', () => {
    const diagram = read('components/docs/docs-diagram.tsx');
    expect(diagram).toContain('Zoom in');
    expect(diagram).toContain('Toggle full screen');
  });

  it('keeps the public demo available without auth imports', () => {
    const page = read('app/demo/notebook/page.tsx');
    expect(page).not.toContain('supabase');
    expect(page).not.toContain('getUser');
  });

  it('normalises signup errors and prevents repeated submission', () => {
    const form = read('components/auth/signup-form.tsx');
    const route = read('app/api/auth/signup/route.ts');
    expect(form).toContain('cooldown');
    expect(form).toContain('disabled={!formValid}');
    expect(route).toContain('normalizeSignupError');
  });

  it('includes the video walkthrough and learning-method page', () => {
    expect(read('app/demo/page.tsx')).toContain('youtube-nocookie.com');
    expect(read('app/about/learning-methods/page.tsx')).toContain('Feynman-style explanation');
  });
});
