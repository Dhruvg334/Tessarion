import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from '@/lib/errors/app-error';
import { clearToolRegistryForTests, registerTool } from '@/lib/tools/registry';
import { executeToolWithRetry } from './retry';

const context = { workspaceId: crypto.randomUUID(), userId: crypto.randomUUID(), requestId: crypto.randomUUID(), traceId: crypto.randomUUID() };

beforeEach(() => clearToolRegistryForTests());

describe('executeToolWithRetry', () => {
  it('retries an idempotent transient failure', async () => {
    let calls = 0;
    registerTool({ name: 'flaky', description: 'flaky', access: 'read', inputSchema: z.object({}), outputSchema: z.object({ ok: z.boolean() }), timeoutMs: 1000, maxRetries: 2, idempotent: true, mcpExposure: 'none', sensitiveOutputFields: [], execute: async () => { calls += 1; if (calls === 1) throw new Error('temporary'); return { ok: true }; } });
    const result = await executeToolWithRetry<Record<string, never>, { ok: boolean }>('flaky', {}, context, { sleep: async () => undefined });
    expect(result.output.ok).toBe(true);
    expect(result.attempts).toHaveLength(2);
  });

  it('does not retry non-idempotent writes', async () => {
    registerTool({ name: 'write_once', description: 'write', access: 'write', inputSchema: z.object({}), outputSchema: z.object({ ok: z.boolean() }), timeoutMs: 1000, maxRetries: 3, idempotent: false, mcpExposure: 'none', sensitiveOutputFields: [], execute: async () => { throw new Error('failed'); } });
    await expect(executeToolWithRetry('write_once', {}, context, { sleep: async () => undefined })).rejects.toBeInstanceOf(AppError);
  });
});
