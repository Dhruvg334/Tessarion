import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

interface DatasetSummary { name: string; path: string; cases: number; minimum: number; }
const datasets: DatasetSummary[] = [
  ['foundation','eval/datasets/b1-foundation.json',3,3],
  ['diagnosis','eval/diagnosis/diagnosis-eval-cases.json',18,18],
  ['retrieval-v2','eval/retrieval-v2/fixtures/cases.json',10,10],
  ['graph-v2','eval/graph-v2/fixtures/cases.json',4,4],
  ['concepts','eval/concepts/fixtures/concept-eval-cases.json',8,8],
  ['teach-back','eval/teach-back/teach-back-eval-cases.json',10,10],
  ['mastery','eval/mastery/fixtures/mastery-eval-cases.json',14,14],
  ['review','eval/review/fixtures/review-eval-cases.json',12,12],
  ['tutoring','eval/tutoring/tutoring-eval-cases.json',12,12],
].map(([name,path,cases,minimum]) => ({ name: String(name), path: String(path), cases: Number(cases), minimum: Number(minimum) }));

function countCases(path: string): number {
  const data = JSON.parse(readFileSync(resolve(path), 'utf8')) as unknown;
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === 'object' && 'cases' in data && Array.isArray((data as { cases: unknown[] }).cases)) return (data as { cases: unknown[] }).cases.length;
  return 0;
}

const report = datasets.map((item) => ({ ...item, cases: countCases(item.path), pass: countCases(item.path) >= item.minimum }));
const totalCases = report.reduce((sum, item) => sum + item.cases, 0);
const payload = { generatedAt: new Date().toISOString(), totalCases, datasets: report, pass: report.every((item) => item.pass) };
const out = resolve('eval/reports/rebuild-b-quality-gate.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload, null, 2));
console.table(report.map(({ name, cases, minimum, pass }) => ({ name, cases, minimum, pass })));
console.log(`Total versioned evaluation cases: ${totalCases}`);
if (!payload.pass) process.exit(1);
