import { NextResponse } from 'next/server';

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(message: string, status = 500, code?: string) {
  return NextResponse.json({ error: { message, code } }, { status });
}

export function unauthorizedResponse() {
  return errorResponse('Unauthenticated', 401, 'UNAUTHORIZED');
}

export function notFoundResponse() {
  return errorResponse('Not Found', 404, 'NOT_FOUND');
}

export function validationErrorResponse(details: unknown) {
  return NextResponse.json({ error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details } }, { status: 400 });
}
