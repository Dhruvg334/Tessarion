import { z } from 'zod';

export const EvaluationTaskSchema = z.enum([
  'retrieval',
  'concept_extraction',
  'graph_reasoning',
  'teach_back',
  'gap_detection',
  'mastery',
  'review',
  'tutoring',
  'tool_selection',
  'workflow_routing',
  'safety',
]);

export const EvaluationCaseSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-_]+$/),
  task: EvaluationTaskSchema,
  title: z.string().min(1).max(200),
  datasetVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  split: z.enum(['development', 'test', 'regression', 'adversarial']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  sourceIds: z.array(z.string()).default([]),
  input: z.record(z.string(), z.unknown()),
  expected: z.record(z.string(), z.unknown()),
  prohibited: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  humanReview: z.object({
    status: z.enum(['pending', 'reviewed', 'approved']),
    reviewer: z.string().nullable(),
    reviewedAt: z.string().datetime().nullable(),
  }),
});

export const EvaluationDatasetSchema = z.object({
  id: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string(),
  cases: z.array(EvaluationCaseSchema).min(1),
});

export type EvaluationCase = z.infer<typeof EvaluationCaseSchema>;
export type EvaluationDataset = z.infer<typeof EvaluationDatasetSchema>;
