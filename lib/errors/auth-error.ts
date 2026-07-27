export type AuthErrorKind =
  | 'invalid_email'
  | 'account_exists'
  | 'rate_limited'
  | 'delivery_unavailable'
  | 'weak_password'
  | 'email_not_confirmed'
  | 'invalid_credentials'
  | 'signup_disabled'
  | 'service_unavailable'
  | 'unknown';

export type NormalizedAuthError = {
  kind: AuthErrorKind;
  message: string;
  status: number;
  retryAfterSeconds?: number;
};

type AuthErrorInput = {
  code?: string | null;
  message?: string | null;
  status?: number | null;
};

const TEST_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'test.example',
  'invalid',
  'localhost',
]);

export function isUnsupportedTestEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1] ?? '';
  return TEST_EMAIL_DOMAINS.has(domain) || domain.endsWith('.example') || domain.endsWith('.test');
}

export function normalizeSignupError(input: AuthErrorInput): NormalizedAuthError {
  const code = input.code?.toLowerCase() ?? '';
  const value = input.message?.toLowerCase() ?? '';
  const status = input.status ?? undefined;

  if (
    status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    value.includes('rate limit') ||
    value.includes('too many requests')
  ) {
    return {
      kind: 'rate_limited',
      message: 'Too many signup attempts were made. Wait a minute before trying again.',
      status: 429,
      retryAfterSeconds: 60,
    };
  }

  if (code === 'email_address_invalid') {
    return {
      kind: 'invalid_email',
      message: 'Use a real email inbox. Example and test domains such as test.com are not accepted by the authentication service.',
      status: 422,
    };
  }

  if (code === 'email_address_not_authorized') {
    return {
      kind: 'delivery_unavailable',
      message: 'This project cannot send confirmation mail to that address until custom SMTP is configured.',
      status: 503,
    };
  }

  if (code === 'email_provider_disabled' || code === 'signup_disabled') {
    return {
      kind: 'signup_disabled',
      message: 'Email signup is disabled in the authentication settings.',
      status: 503,
    };
  }

  if (code === 'email_exists' || code === 'user_already_exists' || value.includes('already registered') || value.includes('already exists')) {
    return {
      kind: 'account_exists',
      message: 'An account already exists for this email. Sign in instead.',
      status: 409,
    };
  }

  if (code === 'weak_password' || (value.includes('password') && (value.includes('weak') || value.includes('least') || value.includes('easy to guess')))) {
    return {
      kind: 'weak_password',
      message: 'Use at least eight characters and avoid common or easily guessed passwords.',
      status: 422,
    };
  }

  if (
    code === 'email_send_failed' ||
    value.includes('smtp') ||
    value.includes('error sending confirmation email') ||
    value.includes('email delivery') ||
    value.includes('confirmation email')
  ) {
    return {
      kind: 'delivery_unavailable',
      message: 'Confirmation email delivery is unavailable. Configure custom SMTP or disable email confirmation while testing.',
      status: 503,
    };
  }

  if (code === 'validation_failed' || value.includes('invalid email') || value.includes('email address is invalid')) {
    return {
      kind: 'invalid_email',
      message: 'This email address was rejected by the authentication service. Check the address and use a real inbox.',
      status: 422,
    };
  }

  return {
    kind: status && status >= 500 ? 'service_unavailable' : 'unknown',
    message: status && status >= 500
      ? 'The authentication service is temporarily unavailable.'
      : 'Account creation could not be completed. Check the authentication settings and try a real email address.',
    status: status && status >= 500 ? 503 : 400,
  };
}

export function normalizeLoginError(input: AuthErrorInput): NormalizedAuthError {
  const code = input.code?.toLowerCase() ?? '';
  const status = input.status ?? undefined;

  if (status === 429 || code === 'over_request_rate_limit') {
    return {
      kind: 'rate_limited',
      message: 'Too many login attempts were made. Wait a minute before trying again.',
      status: 429,
      retryAfterSeconds: 60,
    };
  }

  if (code === 'email_not_confirmed') {
    return {
      kind: 'email_not_confirmed',
      message: 'Confirm your email before signing in. Check your inbox or contact the project owner if email confirmation is disabled.',
      status: 403,
    };
  }

  if (code === 'invalid_credentials' || status === 400 || status === 401) {
    return {
      kind: 'invalid_credentials',
      message: 'The email or password is incorrect, or the account has not been created yet.',
      status: 401,
    };
  }

  return {
    kind: status && status >= 500 ? 'service_unavailable' : 'unknown',
    message: status && status >= 500
      ? 'The authentication service is temporarily unavailable.'
      : 'Sign in could not be completed.',
    status: status && status >= 500 ? 503 : 400,
  };
}
