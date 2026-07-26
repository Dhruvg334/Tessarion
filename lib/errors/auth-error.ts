export type AuthErrorKind =
  | 'invalid_email'
  | 'account_exists'
  | 'rate_limited'
  | 'delivery_unavailable'
  | 'weak_password'
  | 'service_unavailable'
  | 'unknown';

export type NormalizedAuthError = {
  kind: AuthErrorKind;
  message: string;
  status: number;
  retryAfterSeconds?: number;
};

export function normalizeSignupError(message: string, status?: number): NormalizedAuthError {
  const value = message.toLowerCase();

  if (status === 429 || value.includes('rate limit') || value.includes('too many requests')) {
    return {
      kind: 'rate_limited',
      message: 'Too many signup attempts were made. Please wait before trying again.',
      status: 429,
      retryAfterSeconds: 60,
    };
  }

  if (value.includes('already registered') || value.includes('already exists')) {
    return {
      kind: 'account_exists',
      message: 'An account already exists for this email. Sign in instead.',
      status: 409,
    };
  }

  if (value.includes('invalid email') || value.includes('email address is invalid')) {
    return {
      kind: 'invalid_email',
      message: 'This email could not be accepted by the email service. Check the address or try another email.',
      status: 422,
    };
  }

  if (value.includes('password') && (value.includes('weak') || value.includes('least'))) {
    return {
      kind: 'weak_password',
      message: 'Use at least eight characters and avoid common or easily guessed passwords.',
      status: 422,
    };
  }

  if (value.includes('smtp') || value.includes('email') || value.includes('send')) {
    return {
      kind: 'delivery_unavailable',
      message: 'The confirmation email could not be sent. Please try again later.',
      status: 503,
    };
  }

  return {
    kind: status && status >= 500 ? 'service_unavailable' : 'unknown',
    message: status && status >= 500
      ? 'The authentication service is temporarily unavailable.'
      : 'Account creation could not be completed. Please review the details and try again.',
    status: status && status >= 500 ? 503 : 400,
  };
}
