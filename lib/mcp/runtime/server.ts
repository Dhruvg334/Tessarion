import { AppError } from '@/lib/errors/app-error';
import { buildMcpServerManifest } from '@/lib/mcp/manifest';
import { executeToolWithRetry } from '@/lib/tools/runtime';
import type { ToolExecutionContext } from '@/lib/tools/types';
import { McpRequestSchema, type McpResponse } from './protocol';

export async function handleMcpRequest(raw: unknown, context: ToolExecutionContext): Promise<McpResponse> {
  const parsed = McpRequestSchema.safeParse(raw);
  if (!parsed.success) return { jsonrpc: '2.0', id: 'invalid', error: { code: -32600, message: 'Invalid request' } };
  const request = parsed.data;
  try {
    if (request.method === 'initialize') return { jsonrpc: '2.0', id: request.id, result: { protocolVersion: '2025-06-18', serverInfo: { name: 'tessarion', version: '0.1.0' }, capabilities: { tools: {} } } };
    if (request.method === 'tools/list') return { jsonrpc: '2.0', id: request.id, result: { tools: buildMcpServerManifest().tools } };
    const params = request.params ?? {};
    const name = typeof params.name === 'string' ? params.name : '';
    const manifest = buildMcpServerManifest();
    if (!manifest.tools.some((tool) => tool.name === name)) throw new AppError('Tool is not exposed through MCP', 403, 'MCP_TOOL_NOT_EXPOSED');
    const result = await executeToolWithRetry(name, params.arguments ?? {}, context);
    return { jsonrpc: '2.0', id: request.id, result: { content: [{ type: 'text', text: JSON.stringify(result.output) }], isError: false } };
  } catch (error) {
    const code = error instanceof AppError ? error.code : 'MCP_REQUEST_FAILED';
    return { jsonrpc: '2.0', id: request.id, error: { code: -32000, message: 'MCP request failed', data: { safeCode: code } } };
  }
}
