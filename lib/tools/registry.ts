import { AppError } from '@/lib/errors/app-error';
import { ToolDefinition, ToolExecutionContext } from './types';

const tools = new Map<string, ToolDefinition<unknown, unknown>>();

export function registerTool<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void {
  if (tools.has(tool.name)) {
    throw new AppError(`Tool already registered: ${tool.name}`, 500, 'TOOL_ALREADY_REGISTERED');
  }
  tools.set(tool.name, tool as ToolDefinition<unknown, unknown>);
}

export function getTool<TInput, TOutput>(name: string): ToolDefinition<TInput, TOutput> {
  const tool = tools.get(name);
  if (!tool) throw new AppError(`Unknown tool: ${name}`, 404, 'TOOL_NOT_FOUND');
  return tool as ToolDefinition<TInput, TOutput>;
}

export async function executeTool<TInput, TOutput>(
  name: string,
  input: TInput,
  context: ToolExecutionContext
): Promise<TOutput> {
  const tool = getTool<TInput, TOutput>(name);
  const parsedInput = tool.inputSchema.parse(input);

  if (!context.workspaceId || !context.userId) {
    throw new AppError('Tool execution requires workspace and user scope', 403, 'TOOL_SCOPE_REQUIRED');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), tool.timeoutMs);
  const signal = context.signal ?? controller.signal;

  try {
    const output = await tool.execute(parsedInput, { ...context, signal });
    return tool.outputSchema.parse(output);
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (signal.aborted) throw new AppError('Tool execution timed out', 504, 'TOOL_TIMEOUT');
    throw new AppError('Tool execution failed', 500, 'TOOL_EXECUTION_FAILED');
  } finally {
    clearTimeout(timeout);
  }
}

export function listTools(): Array<{ name: string; access: string; mcpExposure: string }> {
  return [...tools.values()].map((tool) => ({
    name: tool.name,
    access: tool.access,
    mcpExposure: tool.mcpExposure,
  }));
}

export function clearToolRegistryForTests(): void {
  tools.clear();
}
