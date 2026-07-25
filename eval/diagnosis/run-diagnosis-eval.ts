import cases from './diagnosis-eval-cases.json';
import { runLearningDiagnosis } from '@/lib/workflows/learning-diagnosis';

interface DiagnosisEvalCase {
  id: string;
  conceptName: string;
  conceptDefinition: string;
  learnerExplanation: string;
  sourceChunks: Array<{ id: string; content: string }>;
  prerequisiteConcepts: string[];
  expectedStatus: string;
  expectedMastery: string | null;
  expectedNextAction: string;
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

async function main(): Promise<void> {
  const results = [];

  for (const testCase of cases as DiagnosisEvalCase[]) {
    const first = await runLearningDiagnosis({
      ...IDS,
      conceptName: testCase.conceptName,
      conceptDefinition: testCase.conceptDefinition,
      learnerExplanation: testCase.learnerExplanation,
      sourceChunks: testCase.sourceChunks,
      prerequisiteConcepts: testCase.prerequisiteConcepts,
      existingMastery: null,
    });

    const second = await runLearningDiagnosis({
      ...IDS,
      conceptName: testCase.conceptName,
      conceptDefinition: testCase.conceptDefinition,
      learnerExplanation: testCase.learnerExplanation,
      sourceChunks: testCase.sourceChunks,
      prerequisiteConcepts: testCase.prerequisiteConcepts,
      existingMastery: null,
    });

    results.push({
      id: testCase.id,
      routeMatch: first.status === testCase.expectedStatus,
      masteryMatch: (first.mastery?.state ?? null) === testCase.expectedMastery,
      nextActionMatch: first.nextAction === testCase.expectedNextAction,
      deterministic:
        first.status === second.status &&
        first.mastery?.state === second.mastery?.state &&
        first.nextAction === second.nextAction &&
        first.gaps.map((gap) => gap.gapType).join('|') === second.gaps.map((gap) => gap.gapType).join('|'),
    });
  }

  const rate = (key: keyof (typeof results)[number]) =>
    results.filter((result) => result[key] === true).length / results.length;

  const metrics = {
    routeAccuracy: rate('routeMatch'),
    masteryAccuracy: rate('masteryMatch'),
    nextActionAccuracy: rate('nextActionMatch'),
    deterministicRepeatability: rate('deterministic'),
  };

  console.table(results);
  console.table(metrics);

  const failed = Object.values(metrics).some((value) => value < 1);
  if (failed) process.exitCode = 1;
}

void main();
