import fs from 'fs';
import path from 'path';
import { calculateMastery, MasteryInput } from '../../lib/mastery/calculate-mastery';
import { CoveredMasteryEvidence, MasteryGapInput, ConceptMastery } from '../../lib/mastery/types';

interface TestCase {
  id: string;
  description: string;
  coveredWell: CoveredMasteryEvidence[];
  gapFindings: MasteryGapInput[];
  existingMastery: { state: string; attemptsCount: number; evidenceCount: number } | null;
  expectedState: string;
  expectedRecommendation: string;
  category: string;
}

function buildExistingMastery(raw: TestCase['existingMastery']): ConceptMastery | undefined {
  if (!raw) return undefined;
  return {
    conceptId: 'c1',
    workspaceId: 'w1',
    userId: 'u1',
    state: raw.state as ConceptMastery['state'],
    confidenceScore: 0.9,
    evidenceCount: raw.evidenceCount,
    attemptsCount: raw.attemptsCount,
    lastAssessedAt: new Date().toISOString(),
    strongestGaps: [],
    coveredSignals: [],
    recommendationLabel: '',
    explanation: '',
  };
}

function runEval() {
  const casesPath = path.join(__dirname, 'fixtures', 'mastery-eval-cases.json');
  const cases: TestCase[] = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

  let stateCorrect = 0;
  let severeGapCorrect = 0;
  let severeGapTotal = 0;
  let insufficientCorrect = 0;
  let insufficientTotal = 0;
  let idempotencyPassed = 0;
  let idempotencyTotal = 0;
  let recommendationCorrect = 0;
  let runSuccess = 0;
  const results: Array<{
    Case: string;
    Expected: string;
    Actual: string;
    StateMatch: string;
    RecMatch: string;
  }> = [];

  for (const tc of cases) {
    try {
      const input: MasteryInput = {
        conceptId: 'c1',
        workspaceId: 'w1',
        userId: 'u1',
        sourceSessionId: 's1',
        sourceExplanationId: 'e1',
        coveredWell: tc.coveredWell,
        gapFindings: tc.gapFindings,
        existingMastery: buildExistingMastery(tc.existingMastery)
      };

      const { newMastery } = calculateMastery(input);

      const stateMatch = newMastery.state === tc.expectedState;
      const recMatch = newMastery.recommendationLabel === tc.expectedRecommendation;

      if (stateMatch) stateCorrect++;
      if (recMatch) recommendationCorrect++;
      runSuccess++;

      // Category-specific metrics
      if (tc.category === 'severe_gap') {
        severeGapTotal++;
        if (stateMatch) severeGapCorrect++;
      }

      if (tc.category === 'insufficient') {
        insufficientTotal++;
        if (stateMatch) insufficientCorrect++;
      }

      if (tc.category === 'idempotency') {
        idempotencyTotal++;
        // Run twice and verify identical
        const { newMastery: second } = calculateMastery(input);
        if (newMastery.state === second.state && newMastery.recommendationLabel === second.recommendationLabel) {
          idempotencyPassed++;
        }
      }

      results.push({
        Case: tc.description,
        Expected: tc.expectedState,
        Actual: newMastery.state,
        StateMatch: stateMatch ? 'PASS' : 'FAIL',
        RecMatch: recMatch ? 'PASS' : 'FAIL',
      });

    } catch {
      results.push({
        Case: tc.description,
        Expected: tc.expectedState,
        Actual: 'ERROR',
        StateMatch: 'FAIL',
        RecMatch: 'FAIL',
      });
    }
  }

  console.log('\n--- Offline Deterministic Mastery Eval ---');
  console.table(results);

  const metrics = {
    'Mastery State Accuracy': stateCorrect / cases.length,
    'Severe Gap Escalation Accuracy': severeGapTotal > 0 ? severeGapCorrect / severeGapTotal : 1.0,
    'Insufficient Evidence Accuracy': insufficientTotal > 0 ? insufficientCorrect / insufficientTotal : 1.0,
    'Idempotency Pass Rate': idempotencyTotal > 0 ? idempotencyPassed / idempotencyTotal : 1.0,
    'Recommendation Label Accuracy': recommendationCorrect / cases.length,
    'Run Success Rate': runSuccess / cases.length,
  };

  console.log('\n--- Metrics ---');
  console.table(Object.entries(metrics).map(([k, v]) => ({
    Metric: k,
    Value: `${(v * 100).toFixed(1)}%`,
  })));

  const thresholds: Record<string, number> = {
    'Mastery State Accuracy': 0.65,
    'Severe Gap Escalation Accuracy': 0.80,
    'Insufficient Evidence Accuracy': 0.90,
    'Idempotency Pass Rate': 1.00,
    'Run Success Rate': 1.00,
  };

  let allPassed = true;
  for (const [name, threshold] of Object.entries(thresholds)) {
    const actual = metrics[name as keyof typeof metrics];
    if (actual < threshold) {
      console.error(`FAIL: ${name} = ${(actual * 100).toFixed(1)}% < ${(threshold * 100).toFixed(1)}% threshold`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('\nAll Mastery Eval Thresholds Passed!');
    process.exit(0);
  } else {
    console.error('\nSome mastery eval thresholds failed.');
    process.exit(1);
  }
}

runEval();
