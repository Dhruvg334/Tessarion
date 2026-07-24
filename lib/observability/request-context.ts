import { randomUUID } from 'crypto';

export function createRequestId(): string {
  return randomUUID();
}

export function createTraceId(): string {
  return randomUUID();
}

export function getOrCreateRequestId(headers?: Headers | Record<string, string>): string {
  if (headers instanceof Headers) {
    return headers.get('x-request-id') || createRequestId();
  }
  if (headers && typeof headers === 'object') {
    return headers['x-request-id'] || createRequestId();
  }
  return createRequestId();
}

const SENSITIVE_KEYS = new Set([
  'apikey',
  'api_key',
  'token',
  'authorization',
  'password',
  'secret',
  'servicerole',
  'service_role',
  'jwt',
  'session'
]);

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase().replace(/[^a-z0-9]/g, ''));
}

export function safeTraceMetadata(metadata: Record<string, unknown> | undefined | null): Record<string, unknown> {
  if (!metadata) return {};
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = safeTraceMetadata(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        (v && typeof v === 'object' && !Array.isArray(v)) 
          ? safeTraceMetadata(v as Record<string, unknown>) 
          : v
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
