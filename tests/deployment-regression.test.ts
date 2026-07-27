import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('deployment regressions', () => {
  it('does not import the unavailable Github symbol from lucide-react', () => {
    const source = read('app/about/page.tsx');
    expect(source).not.toMatch(/import\s*\{[^}]*\bGithub\b[^}]*\}\s*from\s*['"]lucide-react['"]/);
  });

  it('keeps infrastructure scripts compatible with CommonJS tsx execution', () => {
    const bootstrap = read('scripts/bootstrap-infrastructure.ts');
    const validate = read('scripts/validate-infrastructure.ts');

    expect(bootstrap).toContain('async function main()');
    expect(bootstrap).toContain('main().catch');
    expect(validate).toContain('async function main()');
    expect(validate).toContain('main().catch');
  });
});
