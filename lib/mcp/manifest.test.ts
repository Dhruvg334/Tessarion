import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildMcpServerManifest } from './manifest';
import { clearToolRegistryForTests, registerTool } from '@/lib/tools/registry';

beforeEach(() => clearToolRegistryForTests());

describe('buildMcpServerManifest', () => {
  it('exposes only approved registry tools', () => {
    registerTool({
      name: 'visible_tool',
      description: 'Visible read tool',
      access: 'read',
      inputSchema: z.object({}),
      outputSchema: z.object({ ok: z.boolean() }),
      timeoutMs: 1000,
      maxRetries: 0,
      idempotent: true,
      mcpExposure: 'read_only',
      sensitiveOutputFields: [],
      execute: async () => ({ ok: true }),
    });
    registerTool({
      name: 'internal_tool',
      description: 'Internal-only tool',
      access: 'write',
      inputSchema: z.object({}),
      outputSchema: z.object({ ok: z.boolean() }),
      timeoutMs: 1000,
      maxRetries: 0,
      idempotent: false,
      mcpExposure: 'none',
      sensitiveOutputFields: [],
      execute: async () => ({ ok: true }),
    });

    const manifest = buildMcpServerManifest();
    expect(manifest.tools.map((tool) => tool.name)).toEqual(['visible_tool']);
  });
});
