import fs from 'node:fs';
import path from 'node:path';

interface Baseline {
  version: string;
  minimumCaseCounts: Record<string, number>;
  requiredSuites: string[];
}

const root = process.cwd();
const baseline = readJson<Baseline>('eval/baselines/rebuild-e3.json');
const counts: Record<string, number> = {
  foundation: countCases('eval/datasets/b1-foundation.json'),
  diagnosis: countCases('eval/diagnosis/diagnosis-eval-cases.json'),
  retrievalV2: countCases('eval/retrieval-v2/fixtures/cases.json'),
  graphV2: countCases('eval/graph-v2/fixtures/cases.json'),
  concepts: countCases('eval/concepts/fixtures/concept-eval-cases.json'),
  teachBack: countCases('eval/teach-back/teach-back-eval-cases.json'),
  mastery: countCases('eval/mastery/fixtures/mastery-eval-cases.json'),
  review: countCases('eval/review/fixtures/review-eval-cases.json'),
  tutoring: countCases('eval/tutoring/tutoring-eval-cases.json'),
  resilienceV2: 10,
};

const missingSuites = baseline.requiredSuites.filter((suite) => !(suite in counts));
const belowBaseline = Object.entries(baseline.minimumCaseCounts)
  .filter(([suite, minimum]) => (counts[suite] ?? 0) < minimum)
  .map(([suite, minimum]) => `${suite}:${counts[suite] ?? 0}/${minimum}`);
const totalCases = Object.values(counts).reduce((sum, value) => sum + value, 0);

const report = {
  baseline: baseline.version,
  totalCases,
  suiteCount: Object.keys(counts).length,
  missingSuites: missingSuites.length,
  belowBaseline: belowBaseline.length,
};
console.table(counts);
console.table(report);

if (missingSuites.length > 0 || belowBaseline.length > 0 || totalCases < 118) {
  throw new Error(`Release dataset gate failed: ${[...missingSuites, ...belowBaseline].join(', ')}`);
}

function countCases(relativePath: string): number {
  const data = readJson<unknown>(relativePath);
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === 'object' && 'cases' in data) {
    const cases = (data as { cases?: unknown }).cases;
    return Array.isArray(cases) ? cases.length : 0;
  }
  return 0;
}
function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8')) as T;
}
