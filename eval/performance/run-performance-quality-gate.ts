import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const checks: Array<{ name: string; pass: boolean; detail: string }> = [];
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const workspace = read('app/(app)/workspace/[id]/page.tsx');
checks.push({
  name: 'panel-scoped workspace queries',
  pass: workspace.includes('needsStudySummary') && workspace.includes('needsDocuments') && workspace.includes('needsGraph'),
  detail: 'Focused workspace panels must not load every projection and history table.',
});
checks.push({
  name: 'Next.js proxy convention',
  pass: existsSync(resolve(root, 'proxy.ts')) && !existsSync(resolve(root, 'middleware.ts')),
  detail: 'Next.js 16 should use proxy.ts and avoid the deprecated middleware convention.',
});
const publicShell = read('components/site/site-shell.tsx');
checks.push({
  name: 'public shell remains auth-independent',
  pass: !/supabase|auth\.getUser|createServerSupabaseClient/.test(publicShell),
  detail: 'Public navigation must render without a Supabase round trip.',
});
const tutor = read('components/tutoring/tutoring-panel.tsx');
checks.push({
  name: 'bounded tutor network calls',
  pass: !/setInterval|setTimeout\([^)]*fetch/.test(tutor),
  detail: 'Tutoring must be user-triggered, not polled in a loop.',
});

console.table(checks.map(({ name, pass }) => ({ check: name, result: pass ? 'PASS' : 'FAIL' })));
const failed = checks.filter((check) => !check.pass);
if (failed.length) {
  for (const check of failed) console.error(`${check.name}: ${check.detail}`);
  process.exit(1);
}
