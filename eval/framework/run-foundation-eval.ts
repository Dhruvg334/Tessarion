import fs from 'node:fs';
import path from 'node:path';
import { EvaluationDatasetSchema } from '../datasets/schema';

const datasetPath = path.resolve(process.cwd(), 'eval/datasets/b1-foundation.json');
const raw = JSON.parse(fs.readFileSync(datasetPath, 'utf8')) as unknown;
const dataset = EvaluationDatasetSchema.parse(raw);

const approved = dataset.cases.filter((item) => item.humanReview.status === 'approved').length;
const critical = dataset.cases.filter((item) => item.severity === 'critical').length;
const taskCoverage = new Set(dataset.cases.map((item) => item.task)).size;

const report = {
  dataset: `${dataset.id}@${dataset.version}`,
  cases: dataset.cases.length,
  approvedCases: approved,
  criticalCases: critical,
  taskCoverage,
  schemaValidation: 'PASS',
};

console.table(report);

if (approved !== dataset.cases.length) {
  throw new Error('Foundation dataset contains unapproved cases.');
}
