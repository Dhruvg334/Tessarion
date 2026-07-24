import { NextResponse } from 'next/server';
import { AppError } from './app-error';

export function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }
  
  if (err instanceof Error) {
    // If it's a known error type that leaked, wrap it securely
    return new AppError('An unexpected error occurred', 500, 'INTERNAL_ERROR', err.message);
  }
  
  return new AppError('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
}

export function toSafeApiError(err: unknown, fallbackMessage = 'Internal Server Error'): { message: string, code: string, status: number } {
  const normalized = normalizeError(err);
  
  // AppErrors are already vetted, but we ensure their message is safe for client
  // If we ever want to hide even AppErrors, we could check a `isPublic` flag, 
  // but by design AppError is our safe internal wrapper.
  const status = normalized.statusCode || 500;
  
  // For 500s, we might want to be extra careful not to leak internal AppError messages if they contain details
  const message = status >= 500 ? fallbackMessage : normalized.message;
  
  return {
    message,
    code: normalized.code || 'UNKNOWN_ERROR',
    status
  };
}

export function safeErrorResponse(err: unknown, fallbackMessage = 'Internal Server Error'): NextResponse {
  const safeErr = toSafeApiError(err, fallbackMessage);
  return NextResponse.json(
    { error: safeErr.message, code: safeErr.code },
    { status: safeErr.status }
  );
}
