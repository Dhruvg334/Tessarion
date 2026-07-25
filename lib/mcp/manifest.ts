import { z } from 'zod';
import { listTools } from '@/lib/tools/registry';

export const McpToolManifestEntrySchema = z.object({
  name: z.string().min(1),
  access: z.enum(['read', 'write']),
  exposure: z.enum(['read_only', 'approved_write']),
});

export const McpServerManifestSchema = z.object({
  name: z.literal('tessarion'),
  protocolVersion: z.literal('2025-06-18'),
  tools: z.array(McpToolManifestEntrySchema),
  resources: z.array(z.string().min(1)),
});

export type McpServerManifest = z.infer<typeof McpServerManifestSchema>;

export function buildMcpServerManifest(): McpServerManifest {
  const exposedTools = listTools()
    .filter((tool) => tool.mcpExposure !== 'none')
    .map((tool) => ({
      name: tool.name,
      access: tool.access === 'write' ? ('write' as const) : ('read' as const),
      exposure: tool.mcpExposure === 'approved_write'
        ? ('approved_write' as const)
        : ('read_only' as const),
    }));

  return McpServerManifestSchema.parse({
    name: 'tessarion',
    protocolVersion: '2025-06-18',
    tools: exposedTools,
    resources: [
      'workspace://{workspaceId}/sources',
      'workspace://{workspaceId}/concepts',
      'workspace://{workspaceId}/graph',
      'learner://{userId}/mastery',
      'learner://{userId}/reviews',
      'workflow://{traceId}',
    ],
  });
}
