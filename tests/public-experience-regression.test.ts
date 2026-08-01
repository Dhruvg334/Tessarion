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
    const errors = read('lib/errors/auth-error.ts');
    expect(form).toContain('cooldown');
    expect(form).toContain('disabled={!formValid}');
    expect(form).toContain('supabase.auth.signUp');
    expect(errors).toContain('custom SMTP');
    expect(form).not.toContain("fetch('/api/auth/signup'");
  });

  it('uses browser-scoped Supabase auth instead of a shared server proxy', () => {
    const login = read('components/auth/login-form.tsx');
    const signup = read('components/auth/signup-form.tsx');
    expect(login).toContain('supabase.auth.signInWithPassword');
    expect(signup).toContain('supabase.auth.signUp');
    expect(login).not.toContain("fetch('/api/auth/login'");
  });

  it('includes password visibility controls on login and signup', () => {
    expect(read('components/auth/login-form.tsx')).toContain('PasswordInput');
    expect(read('components/auth/signup-form.tsx')).toContain('PasswordInput');
  });

  it('pairs the official video walkthrough with the public interactive notebook', () => {
    const demo = read('app/demo/page.tsx');
    const about = read('app/about/page.tsx');
    const readme = read('README.md');
    expect(demo).toContain('Interactive product demo');
    expect(demo).toContain('Open demo notebook');
    expect(demo).toContain('youtube-nocookie.com/embed/wEGKEA1_CVE');
    expect(about).toContain('https://youtu.be/wEGKEA1_CVE');
    expect(readme).toContain('https://youtu.be/wEGKEA1_CVE');
    expect(demo).not.toContain('temporary');
    expect(read('app/about/learning-methods/page.tsx')).toContain('Feynman-style explanation');
  });

  it('documents the agentic system and current product status', () => {
    const content = read('lib/docs/content.ts');
    expect(content).toContain("slug: 'agentic-system'");
    expect(content).toContain("slug: 'current-status'");
    expect(content).toContain('Extension policy');
    expect(content).toContain('production-observability checks');
  });

  it('keeps Cytoscape edge dimensions numeric for TypeScript compatibility', () => {
    for (const path of [
      'components/demo/demo-knowledge-graph.tsx',
      'components/docs/docs-diagram.tsx',
    ]) {
      const source = read(path);
      expect(source).not.toMatch(/'text-margin-[xy]':\s*'[-\d.]+px'/);
      expect(source).toMatch(/'text-background-padding':\s*'[\d.]+px'/);
      expect(source).not.toMatch(/'text-border-width':\s*'[\d.]+px'/);
      expect(source).not.toMatch(/selector:\s*'edge'[\s\S]{0,500}?width:\s*'[\d.]+px'/);
    }
  });

  it('uses a real interactive graph in the expanded demo', () => {
    const graph = read('components/demo/demo-knowledge-graph.tsx');
    const data = read('lib/demo/notebook.ts');
    expect(graph).toContain("import('cytoscape')");
    expect(data).toContain('Instruction-set architecture');
    expect(data).toContain('Direct memory access');
  });

  it('keeps infrastructure bootstrap compatible with CommonJS execution', () => {
    const script = read('scripts/bootstrap-infrastructure.ts');
    expect(script).toContain('async function main()');
    expect(script).toContain('main().catch');
  });
});
