import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'app/(app)/workspace/[id]/loading.tsx',
  'app/(app)/workspace/[id]/error.tsx',
  'components/shell/route-error-state.tsx',
  'app/demo/notebook/page.tsx',
  'app/docs/page.tsx',
  'app/icon.svg',
  'LICENSE',
];

const results = requiredFiles.map((file) => ({ file, exists: existsSync(file) }));
const rootLayout = readFileSync('app/layout.tsx', 'utf8');
const appLayout = readFileSync('app/(app)/layout.tsx', 'utf8');
const publicShell = readFileSync('components/site/site-shell.tsx', 'utf8');

const checks = {
  requiredFilesPresent: results.every((result) => result.exists),
  skipLinkPresent: rootLayout.includes('href="#main-content"'),
  appMainLandmarkPresent: appLayout.includes('id="main-content"'),
  publicMainLandmarkPresent: publicShell.includes('id="main-content"'),
  publicShellHasNoSupabaseDependency: !/supabase|auth\.getUser/i.test(publicShell),
};

console.table(results);
console.table(checks);

if (Object.values(checks).some((value) => !value)) {
  process.exitCode = 1;
}
