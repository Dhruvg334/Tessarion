import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const migrationDir = path.resolve('supabase', 'migrations');
const files = (await readdir(migrationDir))
  .filter((file) => file.endsWith('.sql'))
  .sort();

const rules = [
  {
    label: 'legacy uuid-ossp function',
    pattern: /\buuid_generate_v4\s*\(/i,
  },
  {
    label: 'unqualified pgvector cosine operator class',
    pattern: /\bembedding\s+vector_cosine_ops\b/i,
  },
  {
    label: 'destructive review table cascade',
    pattern: /drop\s+table\s+if\s+exists\s+public\.review_schedules\s+cascade/i,
  },
  {
    label: 'implicit auth user reference comment',
    pattern: /references\s+auth\.users\s+implicitly/i,
  },
  {
    label: 'unqualified source_chunks relation inside retrieval migration',
    pattern: /\b(?:from|join)\s+source_chunks\b/i,
  },
];

const failures = [];
for (const file of files) {
  const fullPath = path.join(migrationDir, file);
  const sql = await readFile(fullPath, 'utf8');
  for (const rule of rules) {
    if (rule.pattern.test(sql)) {
      failures.push(`${file}: ${rule.label}`);
    }
  }
}

const initial = await readFile(
  path.join(migrationDir, '20260702182413_initial_tessarion_schema.sql'),
  'utf8',
);

if (!/CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+"vector"\s+WITH\s+SCHEMA\s+extensions/i.test(initial)) {
  failures.push('initial migration: pgvector must be installed in the extensions schema');
}

if (!/USING\s+hnsw\s*\(embedding\s+extensions\.vector_cosine_ops\)/i.test(initial)) {
  failures.push('initial migration: HNSW cosine operator class must be schema-qualified');
}

if (failures.length > 0) {
  console.error('Supabase migration audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Supabase migration audit passed for ${files.length} migration files.`);
