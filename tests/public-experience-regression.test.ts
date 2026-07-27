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
    const errors = read('lib/errors/auth-error.ts');
    expect(form).toContain('cooldown');
    expect(form).toContain('disabled={!formValid}');
    expect(route).toContain('normalizeSignupError');
    expect(errors).toContain('custom SMTP');
  });

  it('includes password visibility controls on login and signup', () => {
    expect(read('components/auth/login-form.tsx')).toContain('PasswordInput');
    expect(read('components/auth/signup-form.tsx')).toContain('PasswordInput');
  });

  it('includes the video walkthrough and learning-method page', () => {
    expect(read('app/demo/page.tsx')).toContain('youtube-nocookie.com');
    expect(read('app/about/learning-methods/page.tsx')).toContain('Feynman-style explanation');
  });

  it('documents the agentic system and current product status', () => {
    const content = read('lib/docs/content.ts');
    expect(content).toContain("slug: 'agentic-system'");
    expect(content).toContain("slug: 'current-status'");
    expect(content).toContain('Gemini and Groq');
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

  it('keeps the landing report icon bounded and removes the learning-loop section', () => {
    const page = read('app/(marketing)/page.tsx');
    const report = read('components/site/public/knowledge-report.tsx');
    const styles = read('app/globals.css');
    expect(page).not.toContain('landing-process-section');
    expect(report).toContain('report-graph-links');
    expect(styles).toContain('.knowledge-report-graph .report-graph-links');
  });

  it('uses stable auth error codes and ships the confirmation callback', () => {
    const signup = read('app/api/auth/signup/route.ts');
    const login = read('app/api/auth/login/route.ts');
    const callback = read('app/auth/callback/route.ts');
    expect(signup).toContain('error.code');
    expect(login).toContain('normalizeLoginError');
    expect(callback).toContain('exchangeCodeForSession');
  });

  it('ships structured tutor, review and trace demo panels', () => {
    const demo = read('components/demo/demo-notebook.tsx');
    expect(demo).toContain('demo-tutor-context');
    expect(demo).toContain('demo-review-timeline');
    expect(demo).toContain('demo-trace-summary');
  });

});
