import fs from 'node:fs';
import path from 'node:path';
import { EvaluationDatasetSchema } from '../datasets/schema';

interface FoundationResult {
  caseCount: number;
  approvedRate: number;
  taskCoverage: number;
  adversarialRate: number;
  criticalCoverage: number;
  duplicateIdCount: number;
  prohibitedCoverage: number;
}

const datasetPath = path.resolve(process.cwd(), 'eval/datasets/b1-foundation.json');
const dataset = EvaluationDatasetSchema.parse(JSON.parse(fs.readFileSync(datasetPath, 'utf8')) as unknown);
const ids = dataset.cases.map((item) => item.id);
const duplicateIdCount = ids.length - new Set(ids).size;
const approvedRate = rate(dataset.cases.map((item) => item.humanReview.status === 'approved'));
const adversarialRate = dataset.cases.filter((item) => item.split === 'adversarial').length / dataset.cases.length;
const criticalCoverage = dataset.cases.filter((item) => item.severity === 'critical').length;
const prohibitedCoverage = rate(dataset.cases.map((item) => item.prohibited.length > 0));

const report: FoundationResult = {
  caseCount: dataset.cases.length,
  approvedRate,
  taskCoverage: new Set(dataset.cases.map((item) => item.task)).size,
  adversarialRate,
  criticalCoverage,
  duplicateIdCount,
  prohibitedCoverage,
};

console.table(report);

if (
  report.caseCount < 12
  || report.approvedRate !== 1
  || report.taskCoverage < 3
  || report.adversarialRate < 0.25
  || report.criticalCoverage < 5
  || report.duplicateIdCount !== 0
  || report.prohibitedCoverage < 0.9
) {
  throw new Error('Foundation quality gate failed.');
}

function rate(values: boolean[]): number {
  return values.filter(Boolean).length / Math.max(values.length, 1);
}
