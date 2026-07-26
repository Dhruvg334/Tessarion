import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('review queue query regression', () => {
  const source = readFileSync('lib/services/review.ts', 'utf8');

  it('avoids embedded PostgREST relationship joins for hosted portability', () => {
    expect(source).not.toContain('concept_nodes(name)');
    expect(source).not.toContain('workspaces(name)');
  });

  it('returns bounded user-facing database errors', () => {
    expect(source).toContain("new AppError('The review queue could not be loaded.', 500, 'DB_ERROR'");
    expect(source).not.toContain("new AppError('DB_ERROR', 500");
  });
});
