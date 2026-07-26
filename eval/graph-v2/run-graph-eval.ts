import graphFixture from './fixtures/graph.json';
import casesFixture from './fixtures/cases.json';
import { LocalGraphProjectionStore } from '@/lib/graph/projection/local-store';
import type { GraphRelationshipType, GraphTraversalDirection, WorkspaceGraphProjection } from '@/lib/graph/projection/types';

interface GraphEvalCase {
  id: string;
  seedConceptIds: string[];
  relationshipTypes: GraphRelationshipType[];
  direction: GraphTraversalDirection;
  maxDepth: number;
  minimumConfidence: number;
  expectedConceptIds: string[];
  expectedEvidenceChunkIds: string[];
  forbiddenConceptIds: string[];
}

interface GraphEvalResult {
  id: string;
  conceptRecall: number;
  evidenceRecall: number;
  forbiddenConceptAccuracy: number;
  workspaceScoped: boolean;
  depthBounded: boolean;
  deterministic: boolean;
}

async function main(): Promise<void> {
  const store = new LocalGraphProjectionStore();
  await store.replaceWorkspaceProjection(graphFixture as WorkspaceGraphProjection);
  const results: GraphEvalResult[] = [];

  for (const testCase of casesFixture as GraphEvalCase[]) {
    const query = { workspaceId: 'workspace-eval', seedConceptIds: testCase.seedConceptIds, relationshipTypes: testCase.relationshipTypes, direction: testCase.direction, maxDepth: testCase.maxDepth, maxNodes: 50, minimumConfidence: testCase.minimumConfidence };
    const first = await store.traverse(query);
    const second = await store.traverse(query);
    const returnedConceptIds = new Set(first.nodes.map((node) => node.id).filter((id) => !testCase.seedConceptIds.includes(id)));
    const returnedEvidenceIds = new Set(first.paths.flatMap((path) => path.evidenceChunkIds));

    results.push({
      id: testCase.id,
      conceptRecall: recall(testCase.expectedConceptIds, returnedConceptIds),
      evidenceRecall: recall(testCase.expectedEvidenceChunkIds, returnedEvidenceIds),
      forbiddenConceptAccuracy: testCase.forbiddenConceptIds.every((id) => !returnedConceptIds.has(id)) ? 1 : 0,
      workspaceScoped: first.nodes.every((node) => node.workspaceId === 'workspace-eval'),
      depthBounded: first.paths.every((path) => path.depth <= testCase.maxDepth),
      deterministic: JSON.stringify(first) === JSON.stringify(second),
    });
  }

  const metrics = {
    caseCount: results.length,
    conceptRecall: average(results.map((result) => result.conceptRecall)),
    evidenceRecall: average(results.map((result) => result.evidenceRecall)),
    forbiddenConceptAccuracy: average(results.map((result) => result.forbiddenConceptAccuracy)),
    workspaceScopeAccuracy: rate(results.map((result) => result.workspaceScoped)),
    depthBoundAccuracy: rate(results.map((result) => result.depthBounded)),
    deterministicRepeatability: rate(results.map((result) => result.deterministic)),
  };

  console.table(results);
  console.table(metrics);

  if (metrics.caseCount < 12 || metrics.conceptRecall < 1 || metrics.evidenceRecall < 1 || metrics.forbiddenConceptAccuracy < 1 || metrics.workspaceScopeAccuracy < 1 || metrics.depthBoundAccuracy < 1 || metrics.deterministicRepeatability < 1) {
    process.exitCode = 1;
  }
}

function recall(expected: string[], actual: Set<string>): number {
  if (expected.length === 0) return actual.size === 0 ? 1 : 0;
  return expected.filter((value) => actual.has(value)).length / expected.length;
}
function average(values: number[]): number { return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1); }
function rate(values: boolean[]): number { return values.filter(Boolean).length / Math.max(values.length, 1); }
void main();
