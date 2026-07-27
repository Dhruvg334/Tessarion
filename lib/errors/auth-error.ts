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

  if (status === 429 || value.includes('rate limit') || value.includes('too many requests') || value.includes('email rate limit exceeded')) {
    return {
      kind: 'rate_limited',
      message: 'Email signup is temporarily rate-limited. Wait before trying again or use an address approved by the configured email provider.',
      status: 429,
      retryAfterSeconds: 60,
    };
  }

  if (value.includes('already registered') || value.includes('already exists') || value.includes('user already registered')) {
    return {
      kind: 'account_exists',
      message: 'An account already exists for this email. Sign in instead.',
      status: 409,
    };
  }

  if (value.includes('invalid email') || value.includes('email address is invalid') || value.includes('email address not authorized')) {
    return {
      kind: 'invalid_email',
      message: value.includes('not authorized')
        ? 'This project cannot send confirmation mail to that address until custom SMTP is configured.'
        : 'This email address was rejected by the authentication service. Check the address and domain.',
      status: 422,
    };
  }

  if (value.includes('password') && (value.includes('weak') || value.includes('least') || value.includes('easy to guess'))) {
    return {
      kind: 'weak_password',
      message: 'Use at least eight characters and avoid common or easily guessed passwords.',
      status: 422,
    };
  }

  if (
    value.includes('smtp') ||
    value.includes('error sending confirmation email') ||
    value.includes('email delivery') ||
    value.includes('confirmation email')
  ) {
    return {
      kind: 'delivery_unavailable',
      message: 'Confirmation email delivery is unavailable. Configure custom SMTP or temporarily disable email confirmation for testing.',
      status: 503,
    };
  }

  return {
    kind: status && status >= 500 ? 'service_unavailable' : 'unknown',
    message: status && status >= 500
      ? 'The authentication service is temporarily unavailable.'
      : 'Account creation could not be completed. Review the details and try again.',
    status: status && status >= 500 ? 503 : 400,
  };
}
