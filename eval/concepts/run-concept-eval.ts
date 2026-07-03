import fs from 'fs';
import path from 'path';
import { extractConceptsLocal } from '../../lib/ai/tasks/local-concept-extraction';
import { assertLocalEvalMode } from '../../lib/config/ci-guards';

assertLocalEvalMode();
import { validateConceptGrounding } from '../../lib/ai/tasks/grounding-validation';
import { classifyRelationships } from '../../lib/ai/tasks/relationship-classification';
import { validateRelationships } from '../../lib/graph/validation';
import { SourceChunk } from '../../types/database';

interface EvalCase {
  id: string;
  text: string;
  expectedConcepts: string[];
  expectedRelationships: { source: string; target: string; type: string }[];
}

function calculateF1(precision: number, recall: number) {
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

async function runEval() {
  const casesPath = path.join(__dirname, 'fixtures', 'concept-eval-cases.json');
  const cases: EvalCase[] = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

  let totalConceptTP = 0;
  let totalConceptFP = 0;
  let totalConceptFN = 0;

  let totalRelTP = 0;
  let totalRelFP = 0;
  let totalRelFN = 0;

  let totalProposedConcepts = 0;
  let totalGroundedConcepts = 0;
  let totalUnsupportedConcepts = 0;

  let totalProposedRels = 0;
  let totalEvidencedRels = 0;

  let successfulRuns = 0;

  for (const c of cases) {
    try {
      const mockChunk: SourceChunk = {
        id: `chunk_${c.id}`,
        source_document_id: 'doc1',
        workspace_id: 'ws1',
        content: c.text,
        chunk_index: 0,
        token_count: 50,
        section_hint: null,
        char_start: 0,
        char_end: c.text.length,
        embedding: null,
        created_at: new Date().toISOString()
      };

      // 1. Extract
      const extractedConcepts = await extractConceptsLocal([mockChunk]);
      totalProposedConcepts += extractedConcepts.length;

      // 2. Validate Grounding
      const { accepted, rejected } = validateConceptGrounding(extractedConcepts, [mockChunk], 0.5);
      totalGroundedConcepts += accepted.length;
      totalUnsupportedConcepts += rejected.length;

      // Concept Metrics
      const extractedNames = accepted.map(a => a.name.toLowerCase());
      const expectedNames = c.expectedConcepts.map(e => e.toLowerCase());

      const conceptTP = extractedNames.filter(n => expectedNames.includes(n)).length;
      const conceptFP = extractedNames.filter(n => !expectedNames.includes(n)).length;
      const conceptFN = expectedNames.filter(n => !extractedNames.includes(n)).length;

      totalConceptTP += conceptTP;
      totalConceptFP += conceptFP;
      totalConceptFN += conceptFN;

      // 3. Classify Relationships
      const extractedRels = await classifyRelationships(accepted, [mockChunk], { provider: 'local' });
      totalProposedRels += extractedRels.length;

      // 4. Validate Relationships
      const valRels = validateRelationships(extractedRels, accepted, 0.5);
      totalEvidencedRels += valRels.accepted.length;

      // Relationship Metrics
      const extractedEdges = valRels.accepted.map(r => `${r.sourceNodeName.toLowerCase()}->${r.targetNodeName.toLowerCase()}|${r.relationshipType}`);
      const expectedEdges = c.expectedRelationships.map(r => `${r.source.toLowerCase()}->${r.target.toLowerCase()}|${r.type}`);

      const relTP = extractedEdges.filter(e => expectedEdges.includes(e)).length;
      const relFP = extractedEdges.filter(e => !expectedEdges.includes(e)).length;
      const relFN = expectedEdges.filter(e => !extractedEdges.includes(e)).length;

      totalRelTP += relTP;
      totalRelFP += relFP;
      totalRelFN += relFN;

      successfulRuns++;
    } catch (e) {
      console.error(`Eval run failed for case ${c.id}:`, e);
    }
  }

  // Calculate Aggregates
  const conceptPrecision = totalConceptTP / (totalConceptTP + totalConceptFP) || 0;
  const conceptRecall = totalConceptTP / (totalConceptTP + totalConceptFN) || 0;
  const conceptF1 = calculateF1(conceptPrecision, conceptRecall);

  const relPrecision = totalRelTP / (totalRelTP + totalRelFP) || 0;
  const relRecall = totalRelTP / (totalRelTP + totalRelFN) || 0;
  const relF1 = calculateF1(relPrecision, relRecall);

  const groundingRate = totalProposedConcepts > 0 ? totalGroundedConcepts / totalProposedConcepts : 0;
  const unsupportedRate = totalProposedConcepts > 0 ? totalUnsupportedConcepts / totalProposedConcepts : 0;
  const relEvidenceCoverage = totalProposedRels > 0 ? totalEvidencedRels / totalProposedRels : 1;
  const successRate = cases.length > 0 ? successfulRuns / cases.length : 0;

  console.log('--- Offline Deterministic Concept Extraction Eval ---');
  console.table({
    'Concept F1': conceptF1.toFixed(3),
    'Concept Precision': conceptPrecision.toFixed(3),
    'Concept Recall': conceptRecall.toFixed(3),
    'Relationship F1': relF1.toFixed(3),
    'Relationship Precision': relPrecision.toFixed(3),
    'Relationship Recall': relRecall.toFixed(3),
    'Source Grounding Rate': groundingRate.toFixed(3),
    'Unsupported Concept Rate': unsupportedRate.toFixed(3),
    'Rel Evidence Coverage': relEvidenceCoverage.toFixed(3),
    'Run Success Rate': successRate.toFixed(3)
  });

  let failed = false;
  if (conceptF1 < 0.60) { console.error('FAILED: Concept F1 < 0.60'); failed = true; }
  if (relF1 < 0.35) { console.error('FAILED: Relationship F1 < 0.35'); failed = true; }
  if (groundingRate < 1.0) { console.error('FAILED: Source Grounding Rate < 1.00'); failed = true; }
  if (unsupportedRate > 0.1) { console.error('FAILED: Unsupported Concept Rate > 0.10'); failed = true; }
  if (relEvidenceCoverage < 0.9) { console.error('FAILED: Rel Evidence Coverage < 0.90'); failed = true; }
  if (successRate < 1.0) { console.error('FAILED: Run Success Rate < 1.00'); failed = true; }

  if (failed) {
    process.exit(1);
  } else {
    console.log('All Concept Eval Thresholds Passed!');
    process.exit(0);
  }
}

runEval().catch(console.error);
