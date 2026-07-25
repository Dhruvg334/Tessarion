import { z } from 'zod';

export const McpRequestSchema = z.object({ jsonrpc: z.literal('2.0'), id: z.union([z.string(), z.number()]), method: z.enum(['initialize', 'tools/list', 'tools/call']), params: z.record(z.string(), z.unknown()).optional() });
export type McpRequest = z.infer<typeof McpRequestSchema>;
export interface McpResponse { jsonrpc: '2.0'; id: string | number; result?: unknown; error?: { code: number; message: string; data?: unknown }; }
