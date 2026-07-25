import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { clearToolRegistryForTests, registerTool } from '@/lib/tools/registry';
import { handleMcpRequest } from './server';

const context = { workspaceId: crypto.randomUUID(), userId: crypto.randomUUID(), requestId: crypto.randomUUID(), traceId: crypto.randomUUID() };
beforeEach(() => clearToolRegistryForTests());

describe('handleMcpRequest', () => {
  it('lists only MCP-exposed tools', async () => {
    registerTool({ name: 'visible', description: 'visible', access: 'read', inputSchema: z.object({}), outputSchema: z.object({ ok: z.boolean() }), timeoutMs: 1000, maxRetries: 0, idempotent: true, mcpExposure: 'read_only', sensitiveOutputFields: [], execute: async () => ({ ok: true }) });
    registerTool({ name: 'hidden', description: 'hidden', access: 'read', inputSchema: z.object({}), outputSchema: z.object({ ok: z.boolean() }), timeoutMs: 1000, maxRetries: 0, idempotent: true, mcpExposure: 'none', sensitiveOutputFields: [], execute: async () => ({ ok: true }) });
    const response = await handleMcpRequest({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, context);
    expect(JSON.stringify(response.result)).toContain('visible');
    expect(JSON.stringify(response.result)).not.toContain('hidden');
  });
});
