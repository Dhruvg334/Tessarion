import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('CI workflow', () => {
  it('should run eval:concepts in CI', () => {
    const ciPath = path.join(process.cwd(), '.github', 'workflows', 'ci.yml');
    const content = fs.readFileSync(ciPath, 'utf8');
    expect(content).toContain('npm run eval:concepts');
  });
});
