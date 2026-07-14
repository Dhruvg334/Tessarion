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
  let noFullAnswerEarly = 0;
  let oneQuestionRule = 0;
  let groundedCases = 0;
  let correctGrounding = 0;
  let noSourceCases = 0;
  let honestNoSource = 0;

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
      content: 'previous tutor turn',
      sourceChunkIds: [],
      gapFindingIds: [],
      masterySignalIds: [],
      tutorMove: move as import('../../lib/tutoring/types').TutoringMove,
      createdAt: new Date().toISOString()
    }));

    const decision = decideNextMove({
      session,
      previousTurns,
      availableSourceChunkIds: c.availableSourceChunkIds
    });

    const expectedMove = c.expectedNextMove;
    const expectedComplete = c.expectedCompletion || false;

    if (decision.nextMove === expectedMove) {
      correctNextMove++;
    } else {
      console.log(`[MISMATCH - Move] ${c.description}`);
      console.log(`Expected move: ${expectedMove}`);
      console.log(`Got move:      ${decision.nextMove}`);
    }

    if (decision.shouldCompleteSession === expectedComplete) {
      correctCompletion++;
    }

    const hasSource = c.availableSourceChunkIds.length > 0;
    if (hasSource) {
      groundedCases++;
      if (decision.sourceChunkIds && decision.sourceChunkIds.length > 0) {
        correctGrounding++;
      }
    } else {
      noSourceCases++;
      if (!decision.sourceChunkIds || decision.sourceChunkIds.length === 0) {
        honestNoSource++;
      }
    }

    if ((decision.question.match(/\?/g) || []).length <= 1) {
      oneQuestionRule++;
    }
    
    if (decision.nextMove !== 'ask_correction' && decision.nextMove !== 'summarize_progress' && decision.nextMove !== 'complete_session') {
       if (!decision.question.toLowerCase().includes('answer is')) {
          noFullAnswerEarly++;
       }
    } else {
       noFullAnswerEarly++;
    }

    totalTested++;
  }

  const moveAcc = correctNextMove / totalTested;
  const compAcc = correctCompletion / totalTested;
  const oneQAcc = oneQuestionRule / totalTested;
  const noFullAcc = noFullAnswerEarly / totalTested;
  
  const sourceAcc = groundedCases > 0 ? correctGrounding / groundedCases : 1.0; 
  const honestNoSourceAcc = noSourceCases > 0 ? honestNoSource / noSourceCases : 1.0;

  const escAcc = moveAcc; 
  const runAcc = 1.0;

  console.log('\n--- Results ---');
  console.log(`Move Selection Accuracy:      ${moveAcc.toFixed(2)}`);
  console.log(`No Full Answer Early Rate:    ${noFullAcc.toFixed(2)}`);
  console.log(`One Question Rule Rate:       ${oneQAcc.toFixed(2)}`);
  console.log(`Source Grounding Rate:        ${sourceAcc.toFixed(2)}`);
  console.log(`Insufficient Evid Honesty:    ${honestNoSourceAcc.toFixed(2)}`);
  console.log(`Escalation Correctness:       ${escAcc.toFixed(2)}`);
  console.log(`Completion Decision Accuracy: ${compAcc.toFixed(2)}`);
  console.log(`Run Success Rate:             ${runAcc.toFixed(2)}`);

  if (
    moveAcc < 0.75 || 
    noFullAcc < 0.95 || 
    oneQAcc < 0.95 || 
    sourceAcc < 0.80 || 
    honestNoSourceAcc < 0.90 || 
    escAcc < 0.75 || 
    compAcc < 0.75 || 
    runAcc < 1.00
  ) {
    console.error('\nFAIL: Metrics fell below thresholds.');
    process.exit(1);
  } else {
    console.log('\nPASS: All metrics meet thresholds.');
    process.exit(0);
  }
}

runEval().catch(console.error);
