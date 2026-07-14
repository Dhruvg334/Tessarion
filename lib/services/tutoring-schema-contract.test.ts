import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tutoring Schema Contract', () => {
  it('does not reference non-existent concept_source_relationships table', () => {
    const filePath = path.join(process.cwd(), 'lib/services/tutoring.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    expect(content).not.toContain('concept_source_relationships');
  });
});
