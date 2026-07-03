import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  try {
    const files = readdirSync(dirPath);

    files.forEach(function(file) {
      if (statSync(join(dirPath, file)).isDirectory()) {
        arrayOfFiles = getAllFiles(join(dirPath, file), arrayOfFiles);
      } else {
        arrayOfFiles.push(join(dirPath, file));
      }
    });
  } catch (e) {
    // Ignore
  }
  return arrayOfFiles;
}

describe('Inline Style Regression', () => {
  it('should not contain @media in inline React styles in auth pages', () => {
    const authDir = join(process.cwd(), 'app', '(auth)');
    const files = getAllFiles(authDir).filter(f => f.endsWith('.tsx'));

    files.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/style=\{.*@media/);
    });
  });
});
