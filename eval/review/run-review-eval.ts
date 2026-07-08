import fs from 'fs';
import path from 'path';
import { calculateReviewRecommendation } from '../../lib/review/calculate-review';
import { ConceptMastery, MasteryState } from '../../lib/mastery/types';

interface FixtureCase {
  name: string;
  masteryState: MasteryState;
  expectedType: string | null;
  expectedPriority: string | null;
  expectedStatus: string;
  expectedOffsetDays?: number;
  existingActiveStatus?: string;
  existingActivePriority?: string;
  simulate?: string;
  inputSignals?: string[];
  legacyFallback?: boolean;
}

const fixturesPath = path.join(__dirname, 'fixtures', 'review-eval-cases.json');
const fixtures: FixtureCase[] = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

const thresholds: Record<string, number> = {
  'Idempotency Pass Rate': 1.00,
  'Stale Override Accuracy': 1.00,
  'Traceability Coverage': 0.50, // Should be less than 1.00 when legacy fallbacks happen
  'Understood Cap Accuracy': 1.00,
  'Run Success Rate': 1.00,
};

interface ActiveReview {
  id: string;
  conceptId: string;
  status: string;
  priority: string;
  reasonType: string;
  signalIds: string[];
}

async function runEval() {
  console.log('Running Review Service Simulation Eval...');
  const now = new Date();

  let idempotencyCorrect = 0;
  let idempotencyTotal = 0;
  
  let staleOverrideCorrect = 0;
  let staleOverrideTotal = 0;
  
  let traceabilityCorrect = 0;
  let traceabilityTotal = 0;
  
  let capCorrect = 0;
  let capTotal = 0;
  
  let validRuns = 0;
  const totalRuns = fixtures.length;

  for (const tc of fixtures) {
    try {
      const activeReviews = new Map<string, ActiveReview>();
      const dbStore: ActiveReview[] = [];

      // Setup initial state based on fixture
      if (tc.existingActiveStatus) {
        const initialReview: ActiveReview = {
          id: 'rev-1',
          conceptId: 'concept-1',
          status: tc.existingActiveStatus,
          priority: tc.existingActivePriority || 'medium',
          reasonType: tc.simulate === 'understood_cap' ? 'scheduled_reinforcement' : 'needs_review',
          signalIds: []
        };
        dbStore.push(initialReview);
        if (['queued', 'due', 'overdue'].includes(tc.existingActiveStatus)) {
          activeReviews.set('concept-1', initialReview);
        }
      }

      if (tc.simulate === 'understood_cap') {
        for (let i = 2; i <= 4; i++) {
          const capReview: ActiveReview = {
            id: `rev-${i}`,
            conceptId: `concept-${i}`,
            status: 'queued',
            priority: 'low',
            reasonType: 'scheduled_reinforcement',
            signalIds: []
          };
          dbStore.push(capReview);
          activeReviews.set(`concept-${i}`, capReview);
        }
      }

      const mockMastery: ConceptMastery = {
        workspaceId: 'ws-1',
        userId: 'user-1',
        conceptId: 'concept-1',
        state: tc.masteryState,
        score: 0,
        confidenceScore: 0.9,
        evidenceCount: 1,
        attemptsCount: 1,
        lastAssessedAt: now.toISOString(),
        strongestGaps: [],
        coveredSignals: [],
        recommendationLabel: '',
        explanation: ''
      };

      let action = 'skipped';
      let finalReviewState: ActiveReview | null = null;
      const providedSignalIds = tc.inputSignals || [];
      
      // Simulate validation failure
      if (providedSignalIds.some(s => s.includes('invalid'))) {
        action = 'invalid_scope';
      } else {
        const rec = calculateReviewRecommendation(mockMastery, now);
        const existingActive = activeReviews.get('concept-1');
        const isScheduleable = rec.suggestedReviewAt !== null && rec.priority !== null && rec.reasonType !== null;
        
        if (!isScheduleable) {
          if (existingActive) {
            existingActive.status = 'suspended';
            action = 'suspended';
            finalReviewState = existingActive;
          } else {
            action = 'skippedNotReady';
          }
        } else {
          let capReached = false;
          if (rec.masteryState === 'understood') {
            const count = dbStore.filter(r => ['queued', 'due', 'overdue'].includes(r.status) && r.reasonType === 'scheduled_reinforcement').length;
            const alreadyReinforcement = existingActive && existingActive.reasonType === 'scheduled_reinforcement';
            if (count >= 3 && !alreadyReinforcement) {
              capReached = true;
            }
          }

          if (capReached) {
            action = 'skippedUnderstoodCap';
          } else if (existingActive) {
            existingActive.priority = rec.priority!;
            existingActive.reasonType = rec.reasonType!;
            existingActive.signalIds = providedSignalIds;
            action = 'updated';
            finalReviewState = existingActive;
          } else {
            const newReview: ActiveReview = {
              id: 'rev-new',
              conceptId: 'concept-1',
              status: 'queued',
              priority: rec.priority!,
              reasonType: rec.reasonType!,
              signalIds: providedSignalIds
            };
            dbStore.push(newReview);
            activeReviews.set('concept-1', newReview);
            action = 'created';
            finalReviewState = newReview;
          }
        }
      }

      if (tc.simulate === 'idempotency') {
        idempotencyTotal++;
        if (action === 'updated' && finalReviewState?.priority === tc.expectedPriority && finalReviewState?.reasonType === tc.expectedType) {
          idempotencyCorrect++;
        }
      }

      if (tc.simulate === 'stale_override') {
        staleOverrideTotal++;
        if (action === 'updated' && finalReviewState?.priority === tc.expectedPriority && finalReviewState?.reasonType === tc.expectedType) {
          staleOverrideCorrect++;
        }
      }

      if (tc.simulate === 'suspension') {
        staleOverrideTotal++;
        if (action === 'suspended' && finalReviewState?.status === 'suspended') {
          staleOverrideCorrect++;
        }
      }

      if (tc.simulate === 'understood_cap') {
        capTotal++;
        if (tc.expectedStatus === 'capped' && action === 'skippedUnderstoodCap') {
          capCorrect++;
        } else if (tc.expectedStatus !== 'capped' && action !== 'skippedUnderstoodCap') {
          capCorrect++;
        }
      }
      
      // Traceability logic
      // Traceability is correct only if expectedStatus != not_ready, action created/updated, and signalIds length > 0
      if (tc.simulate === 'traceability') {
        traceabilityTotal++;
        if (action === 'created' || action === 'updated') {
          if (!tc.legacyFallback && finalReviewState && finalReviewState.signalIds.length > 0) {
            // Check they match input signals
            const match = finalReviewState.signalIds.every(id => tc.inputSignals?.includes(id));
            if (match) traceabilityCorrect++;
          }
        }
      }
      
      if ((tc.expectedStatus === 'invalid_scope' && action === 'invalid_scope') || 
          (tc.expectedStatus !== 'invalid_scope' && action !== 'invalid_scope')) {
        validRuns++;
      }
      
    } catch (e: unknown) {
      const err = e as Error;
      console.error(`[FAIL] ${tc.name}: Threw error ${err.message}`);
    }
  }

  const metrics: Record<string, number> = {
    'Idempotency Pass Rate': idempotencyTotal > 0 ? idempotencyCorrect / idempotencyTotal : 1,
    'Stale Override Accuracy': staleOverrideTotal > 0 ? staleOverrideCorrect / staleOverrideTotal : 1,
    'Traceability Coverage': traceabilityTotal > 0 ? traceabilityCorrect / traceabilityTotal : 1,
    'Understood Cap Accuracy': capTotal > 0 ? capCorrect / capTotal : 1,
    'Run Success Rate': totalRuns > 0 ? validRuns / totalRuns : 1
  };

  console.log('\n--- Review Eval Metrics ---');
  let passed = true;
  for (const [metric, value] of Object.entries(metrics)) {
    const thresh = thresholds[metric] || 0;
    const formatted = (value * 100).toFixed(1) + '%';
    const status = value >= thresh ? 'PASS' : 'FAIL';
    console.log(`${metric.padEnd(35)}: ${formatted.padEnd(6)} | Threshold: ${(thresh * 100).toFixed(0)}% [${status}]`);
    if (value < thresh) passed = false;
  }

  if (passed) {
    console.log('\n✅ All Review Eval Thresholds Passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Review Eval Failed to meet thresholds.');
    process.exit(1);
  }
}

runEval().catch(err => {
  console.error('Eval harness failed:', err);
  process.exit(1);
});
