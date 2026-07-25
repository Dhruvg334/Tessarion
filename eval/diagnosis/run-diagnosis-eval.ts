import cases from './diagnosis-eval-cases.json';
import { runLearningDiagnosis } from '@/lib/workflows/learning-diagnosis';

interface DiagnosisEvalCase {
  id: string;
  category: string;
  conceptName: string;
  conceptDefinition: string;
  learnerExplanation: string;
  sourceChunks: Array<{ id: string; content: string }>;
  prerequisiteConcepts: string[];
  expectedStatus: string;
  expectedMastery: string | null;
  expectedNextAction: string;
  expectedGapTypes: string[];
}

interface DiagnosisEvalResult {
  id: string;
  category: string;
  routeMatch: boolean;
  masteryMatch: boolean;
  nextActionMatch: boolean;
  gapTypesMatch: boolean;
  deterministic: boolean;
  expectedStatus: string;
  actualStatus: string;
  expectedMastery: string | null;
  actualMastery: string | null;
  expectedNextAction: string;
  actualNextAction: string | null;
  expectedGapTypes: string;
  actualGapTypes: string;
  errorCode: string | null;
}

const IDS = {
  runId: '11111111-1111-4111-8111-111111111111',
  traceId: '22222222-2222-4222-8222-222222222222',
  workspaceId: '33333333-3333-4333-8333-333333333333',
  userId: '44444444-4444-4444-8444-444444444444',
  sessionId: '55555555-5555-4555-8555-555555555555',
  explanationId: '66666666-6666-4666-8666-666666666666',
  conceptId: '77777777-7777-4777-8777-777777777777',
};

function normalizedGapTypes(gaps: Array<{ gapType: string }>): string[] {
  return gaps.map((gap) => gap.gapType).sort();
}

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

async function main(): Promise<void> {
  const results: DiagnosisEvalResult[] = [];

  for (const testCase of cases as DiagnosisEvalCase[]) {
    const input = {
      ...IDS,
      conceptName: testCase.conceptName,
      conceptDefinition: testCase.conceptDefinition,
      learnerExplanation: testCase.learnerExplanation,
      sourceChunks: testCase.sourceChunks,
      prerequisiteConcepts: testCase.prerequisiteConcepts,
      existingMastery: null,
    };

    const first = await runLearningDiagnosis(input);
    const second = await runLearningDiagnosis(input);
    const actualGapTypes = normalizedGapTypes(first.gaps);
    const expectedGapTypes = [...testCase.expectedGapTypes].sort();

    results.push({
      id: testCase.id,
      category: testCase.category,
      routeMatch: first.status === testCase.expectedStatus,
      masteryMatch: (first.mastery?.state ?? null) === testCase.expectedMastery,
      nextActionMatch: first.nextAction === testCase.expectedNextAction,
      gapTypesMatch: arraysEqual(actualGapTypes, expectedGapTypes),
      deterministic:
        first.status === second.status &&
        first.mastery?.state === second.mastery?.state &&
        first.nextAction === second.nextAction &&
        arraysEqual(actualGapTypes, normalizedGapTypes(second.gaps)),
      expectedStatus: testCase.expectedStatus,
      actualStatus: first.status,
      expectedMastery: testCase.expectedMastery,
      actualMastery: first.mastery?.state ?? null,
      expectedNextAction: testCase.expectedNextAction,
      actualNextAction: first.nextAction,
      expectedGapTypes: expectedGapTypes.join(', '),
      actualGapTypes: actualGapTypes.join(', '),
      errorCode: first.errorCode,
    });
  }

  const rate = (key: keyof DiagnosisEvalResult): number =>
    results.filter((result) => result[key] === true).length / results.length;

  const metrics = {
    caseCount: results.length,
    routeAccuracy: rate('routeMatch'),
    masteryAccuracy: rate('masteryMatch'),
    nextActionAccuracy: rate('nextActionMatch'),
    gapTypeAccuracy: rate('gapTypesMatch'),
    deterministicRepeatability: rate('deterministic'),
  };

  console.table(
    results.map(({
      id,
      category,
      routeMatch,
      masteryMatch,
      nextActionMatch,
      gapTypesMatch,
      deterministic,
    }) => ({
      id,
      category,
      routeMatch,
      masteryMatch,
      nextActionMatch,
      gapTypesMatch,
      deterministic,
    }))
  );
  console.table(metrics);

  const failedCases = results.filter(
    (result) =>
      !result.routeMatch ||
      !result.masteryMatch ||
      !result.nextActionMatch ||
      !result.gapTypesMatch ||
      !result.deterministic
  );

  if (failedCases.length > 0) {
    console.error(`Diagnosis evaluation failed for ${failedCases.length} of ${results.length} cases.`);
    console.table(
      failedCases.map((result) => ({
        id: result.id,
        expectedStatus: result.expectedStatus,
        actualStatus: result.actualStatus,
        expectedMastery: result.expectedMastery,
        actualMastery: result.actualMastery,
        expectedNextAction: result.expectedNextAction,
        actualNextAction: result.actualNextAction,
        expectedGapTypes: result.expectedGapTypes,
        actualGapTypes: result.actualGapTypes,
        errorCode: result.errorCode,
      }))
    );
    process.exitCode = 1;
  }
}

void main();
