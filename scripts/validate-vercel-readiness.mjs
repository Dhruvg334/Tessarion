import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'app/layout.tsx',
  'app/api/health/route.ts',
  'proxy.ts',
  'vercel.json',
  '.env.example',
  'LICENSE',
];

const failures = [];
for (const file of requiredFiles) {
  if (!existsSync(file)) failures.push(`Missing required deployment file: ${file}`);
}

if (existsSync('middleware.ts')) failures.push('middleware.ts must be removed; Next.js 16 uses proxy.ts.');

if (existsSync('vercel.json')) {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  if (config.framework !== 'nextjs') failures.push('vercel.json must declare the nextjs framework.');
  if (config.installCommand !== 'npm ci') failures.push('Vercel installCommand must remain npm ci.');
  if (config.buildCommand !== 'npm run build') failures.push('Vercel buildCommand must remain npm run build.');
}

const envExample = existsSync('.env.example') ? readFileSync('.env.example', 'utf8') : '';
for (const name of [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'TESSARION_APP_URL',
]) {
  if (!envExample.includes(`${name}=`)) failures.push(`.env.example is missing ${name}.`);
}

if (failures.length > 0) {
  console.error('Vercel readiness check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Vercel readiness check passed.');
console.log('Required production variables:');
console.log('- NEXT_PUBLIC_SUPABASE_URL');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('- SUPABASE_SERVICE_ROLE_KEY');
console.log('- NEXT_PUBLIC_SITE_URL');
console.log('- TESSARION_APP_URL');
console.log('Optional integrations can be added after the first healthy deployment.');
