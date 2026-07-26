import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getInfrastructureConfig } from '@/lib/infrastructure/config';
import { handleMcpRequest } from '@/lib/mcp/runtime/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const config = getInfrastructureConfig();
  if (!config.mcpServerToken) {
    return NextResponse.json({ error: { code: 'MCP_NOT_CONFIGURED', message: 'MCP endpoint is not configured.' } }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${config.mcpServerToken}`) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized.' } }, { status: 401 });
  }

  const workspaceId = request.headers.get('x-tessarion-workspace-id');
  const userId = request.headers.get('x-tessarion-user-id');
  if (!workspaceId || !userId) {
    return NextResponse.json({ error: { code: 'MCP_SCOPE_REQUIRED', message: 'Workspace and user scope are required.' } }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'Invalid JSON request.' } }, { status: 400 });
  }

  const requestId = request.headers.get('x-request-id') ?? randomUUID();
  const response = await handleMcpRequest(payload, {
    workspaceId,
    userId,
    requestId,
    traceId: request.headers.get('x-trace-id') ?? requestId,
  });
  return NextResponse.json(response, { headers: { 'cache-control': 'no-store', 'x-request-id': requestId } });
}
