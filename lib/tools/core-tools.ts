import { z } from 'zod';
import { retrieveRelevantChunks } from '@/lib/services/retrieval';
import { getWorkspaceGraph } from '@/lib/services/graph';
import { getConceptMastery } from '@/lib/services/mastery';
import { getWorkspaceReviewQueue } from '@/lib/services/review';
import { registerTool } from './registry';

const RetrievedChunkSchema = z.object({
  id: z.string(),
  sourceDocumentId: z.string(),
  workspaceId: z.string(),
  content: z.string(),
  chunkIndex: z.number(),
  tokenCount: z.number(),
  sectionHint: z.string().optional(),
  confidence: z.number(),
});

const RetrieveEvidenceInputSchema = z.object({
  query: z.string().min(1).max(2_000),
  limit: z.number().int().min(1).max(20).default(8),
});
const RetrieveEvidenceOutputSchema = z.object({ chunks: z.array(RetrievedChunkSchema).max(20) });
type RetrieveEvidenceInput = z.infer<typeof RetrieveEvidenceInputSchema>;
type RetrieveEvidenceOutput = z.infer<typeof RetrieveEvidenceOutputSchema>;

const TraverseGraphInputSchema = z.object({
  conceptId: z.string().uuid().optional(),
  maxNodes: z.number().int().min(1).max(50).default(50),
});
const TraverseGraphOutputSchema = z.object({
  nodes: z.array(z.unknown()),
  edges: z.array(z.unknown()),
  truncated: z.boolean(),
});
type TraverseGraphInput = z.infer<typeof TraverseGraphInputSchema>;
type TraverseGraphOutput = z.infer<typeof TraverseGraphOutputSchema>;

const MasteryInputSchema = z.object({ conceptId: z.string().uuid() });
const MasteryOutputSchema = z.object({ mastery: z.unknown().nullable() });
type MasteryInput = z.infer<typeof MasteryInputSchema>;
type MasteryOutput = z.infer<typeof MasteryOutputSchema>;

const ReviewQueueInputSchema = z.object({ limit: z.number().int().min(1).max(50).default(20) });
const ReviewQueueOutputSchema = z.object({ reviews: z.array(z.unknown()).max(50) });
type ReviewQueueInput = z.infer<typeof ReviewQueueInputSchema>;
type ReviewQueueOutput = z.infer<typeof ReviewQueueOutputSchema>;

export function registerCoreTools(): void {
  registerTool<RetrieveEvidenceInput, RetrieveEvidenceOutput>({
    name: 'retrieve_evidence_chunks',
    description: 'Retrieve source chunks scoped to the authenticated workspace.',
    access: 'read',
    inputSchema: RetrieveEvidenceInputSchema,
    outputSchema: RetrieveEvidenceOutputSchema,
    timeoutMs: 20_000,
    maxRetries: 1,
    idempotent: true,
    mcpExposure: 'read_only',
    sensitiveOutputFields: ['chunks.content'],
    execute: async (input, context) => ({
      chunks: await retrieveRelevantChunks(context.workspaceId, context.userId, input.query, { limit: input.limit }),
    }),
  });

  registerTool<TraverseGraphInput, TraverseGraphOutput>({
    name: 'traverse_concept_graph',
    description: 'Load the current workspace concept graph and mastery projection.',
    access: 'read',
    inputSchema: TraverseGraphInputSchema,
    outputSchema: TraverseGraphOutputSchema,
    timeoutMs: 15_000,
    maxRetries: 1,
    idempotent: true,
    mcpExposure: 'read_only',
    sensitiveOutputFields: [],
    execute: async (input, context) => {
      const graph = await getWorkspaceGraph(context.workspaceId, context.userId);
      const nodes = graph.nodes.slice(0, input.maxNodes);
      const nodeIds = new Set(nodes.map((node) => node.id));
      return {
        nodes,
        edges: graph.edges.filter((edge) => nodeIds.has(edge.source_node_id) && nodeIds.has(edge.target_node_id)),
        truncated: graph.nodes.length > nodes.length,
      };
    },
  });

  registerTool<MasteryInput, MasteryOutput>({
    name: 'get_learner_mastery',
    description: 'Read the learner mastery record for one concept.',
    access: 'read',
    inputSchema: MasteryInputSchema,
    outputSchema: MasteryOutputSchema,
    timeoutMs: 10_000,
    maxRetries: 1,
    idempotent: true,
    mcpExposure: 'read_only',
    sensitiveOutputFields: [],
    execute: async (input, context) => ({
      mastery: await getConceptMastery(context.workspaceId, input.conceptId, context.userId),
    }),
  });

  registerTool<ReviewQueueInput, ReviewQueueOutput>({
    name: 'get_review_queue',
    description: 'Read the learner review queue for the active workspace.',
    access: 'read',
    inputSchema: ReviewQueueInputSchema,
    outputSchema: ReviewQueueOutputSchema,
    timeoutMs: 10_000,
    maxRetries: 1,
    idempotent: true,
    mcpExposure: 'read_only',
    sensitiveOutputFields: [],
    execute: async (input, context) => ({
      reviews: (await getWorkspaceReviewQueue(context.workspaceId, context.userId)).slice(0, input.limit),
    }),
  });
}
