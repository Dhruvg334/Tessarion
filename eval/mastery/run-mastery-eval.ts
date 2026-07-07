import fs from 'fs';
import path from 'path';
import { calculateMastery } from '../../lib/mastery/calculate-mastery';

interface TestCase {
  id: string;
  description: string;
  coveredWell: string[];
  gapFindings: any[];
  existingMastery: any | null;
  expectedState: string;
}

function runEval() {
  const casesPath = path.join(__dirname, 'fixtures', 'mastery-eval-cases.json');
  const cases: TestCase[] = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

  let passCount = 0;
  const results: any[] = [];

  for (const tc of cases) {
    const { newMastery } = calculateMastery({
      conceptId: 'c1',
      workspaceId: 'w1',
      userId: 'u1',
      sourceSessionId: 's1',
      coveredWell: tc.coveredWell,
      gapFindings: tc.gapFindings,
      existingMastery: tc.existingMastery
    });

    const passed = newMastery.state === tc.expectedState;
    if (passed) passCount++;

    results.push({
      id: tc.id,
      description: tc.description,
      expected: tc.expectedState,
      actual: newMastery.state,
      passed
    });
  }

  console.log('\n--- Offline Deterministic Mastery Eval ---');
  console.table(results.map(r => ({
    Case: r.description,
    Expected: r.expected,
    Actual: r.actual,
    Result: r.passed ? 'PASS' : 'FAIL'
  })));

  const successRate = passCount / cases.length;
  console.log(`\nSuccess Rate: ${(successRate * 100).toFixed(1)}%`);

  if (successRate < 1.0) {
    console.error('Some mastery eval cases failed.');
    process.exit(1);
  } else {
    console.log('All Mastery Eval Thresholds Passed!');
    process.exit(0);
  }
}

runEval();
