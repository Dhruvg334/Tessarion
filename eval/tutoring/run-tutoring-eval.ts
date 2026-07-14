import fs from 'fs';
import path from 'path';
import { decideNextMove } from '../../lib/tutoring/decide-next-move';
import { assertLocalEvalMode } from '../../lib/config/ci-guards';
import { TutoringTurn, TutoringSession } from '../../lib/tutoring/types';

assertLocalEvalMode();

async function runEval() {
  const casesPath = path.join(process.cwd(), 'eval/tutoring/tutoring-eval-cases.json');
  const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

  let totalTested = 0;
  let correctNextMove = 0;
  let correctCompletion = 0;

  console.log('--- Offline Deterministic Tutoring Eval ---');

  for (const c of cases) {
    const session: TutoringSession = {
      id: 'test-session',
      workspaceId: 'test-workspace',
      userId: 'test-user',
      conceptId: 'test-concept',
      teachBackSessionId: null,
      reviewScheduleId: null,
      focusType: c.session.focusType,
      focusSummary: c.session.focusSummary,
      status: 'active',
      currentTurnCount: c.session.currentTurnCount,
      maxTurns: c.session.maxTurns,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    };

    const previousTurns: TutoringTurn[] = c.previousTutorMoves.map((move: string, i: number) => ({
      id: `turn-${i}`,
      tutoringSessionId: 'test-session',
      workspaceId: 'test-workspace',
      userId: 'test-user',
      role: 'tutor',
      turnType: 'socratic_question',
      content: 'placeholder',
      sourceChunkIds: [],
      gapFindingIds: [],
      masterySignalIds: [],
      tutorMove: move as import('../../lib/tutoring/types').TutoringMove,
      createdAt: new Date().toISOString()
    }));

    const decision = decideNextMove({
      session,
      previousTurns,
      availableSourceChunkIds: []
    });

    const expectedMove = c.expectedNextMove;
    const expectedComplete = c.expectedToComplete || false;

    if (decision.nextMove === expectedMove) {
      correctNextMove++;
    } else {
      console.log(`[MISMATCH - Move] ${c.description}`);
      console.log(`Expected move: ${expectedMove}`);
      console.log(`Got move:      ${decision.nextMove}`);
    }

    if (decision.shouldCompleteSession === expectedComplete) {
      correctCompletion++;
    } else {
      console.log(`[MISMATCH - Complete] ${c.description}`);
      console.log(`Expected completion: ${expectedComplete}`);
      console.log(`Got completion:      ${decision.shouldCompleteSession}`);
    }

    totalTested++;
  }

  console.log('\n--- Results ---');
  console.log(`Total Cases Tested:  ${totalTested}`);
  console.log(`Correct Next Move:   ${correctNextMove}/${totalTested} (${Math.round(correctNextMove / totalTested * 100)}%)`);
  console.log(`Correct Completion:  ${correctCompletion}/${totalTested} (${Math.round(correctCompletion / totalTested * 100)}%)`);

  if (correctNextMove < totalTested || correctCompletion < totalTested) {
    console.error('\nFAIL: Deterministic policy violated.');
    process.exit(1);
  } else {
    console.log('\nPASS: All tutoring decisions are deterministic and safe.');
    process.exit(0);
  }
}

runEval().catch(console.error);
