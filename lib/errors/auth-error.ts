export type AuthErrorKind =
  | 'invalid_email'
  | 'account_exists'
  | 'rate_limited'
  | 'delivery_unavailable'
  | 'weak_password'
  | 'email_not_confirmed'
  | 'invalid_credentials'
  | 'service_unavailable'
  | 'unknown';

export type NormalizedAuthError = {
  kind: AuthErrorKind;
  message: string;
  status: number;
  retryAfterSeconds?: number;
};

type SupabaseAuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

function normaliseCode(error: SupabaseAuthErrorLike): string {
  return (error.code ?? '').trim().toLowerCase();
}

function normaliseMessage(error: SupabaseAuthErrorLike): string {
  return (error.message ?? '').trim().toLowerCase();
}

export function normalizeSignupError(error: SupabaseAuthErrorLike): NormalizedAuthError {
  const code = normaliseCode(error);
  const message = normaliseMessage(error);

  if (code === 'over_email_send_rate_limit') {
    return {
      kind: 'rate_limited',
      message: 'The project email quota is currently exhausted. Configure custom SMTP or wait for the Supabase email quota to reset.',
      status: 429,
    };
  }

  if (code === 'over_request_rate_limit' || error.status === 429) {
    return {
      kind: 'rate_limited',
      message: 'Too many authentication requests were sent from this connection. Wait a few minutes before trying again.',
      status: 429,
      retryAfterSeconds: 180,
    };
  }

  if (code === 'email_address_invalid') {
    return {
      kind: 'invalid_email',
      message: 'Supabase rejected this email address. Use a real inbox rather than an example or test domain.',
      status: 422,
    };
  }

  if (code === 'email_address_not_authorized') {
    return {
      kind: 'delivery_unavailable',
      message: 'This Supabase project cannot send to that address until custom SMTP is configured.',
      status: 503,
    };
  }

  if (code === 'email_exists' || code === 'user_already_exists' || message.includes('already registered')) {
    return {
      kind: 'account_exists',
      message: 'An account already exists for this email. Sign in instead.',
      status: 409,
    };
  }

  if (code === 'weak_password' || (message.includes('password') && message.includes('weak'))) {
    return {
      kind: 'weak_password',
      message: 'Use a stronger password with at least eight characters.',
      status: 422,
    };
  }

  if (code === 'signup_disabled' || code === 'email_provider_disabled') {
    return {
      kind: 'service_unavailable',
      message: 'Email account creation is disabled for this Supabase project.',
      status: 503,
    };
  }

  if (error.status && error.status >= 500) {
    return {
      kind: 'service_unavailable',
      message: 'Supabase Auth is temporarily unavailable. Check the Auth logs and email configuration.',
      status: 503,
    };
  }

  return {
    kind: 'unknown',
    message: 'Account creation could not be completed. Check Supabase Auth logs for the exact provider response.',
    status: 400,
  };
}

export function normalizeLoginError(error: SupabaseAuthErrorLike): NormalizedAuthError {
  const code = normaliseCode(error);

  if (code === 'email_not_confirmed') {
    return {
      kind: 'email_not_confirmed',
      message: 'Confirm your email before signing in. Check your inbox or configure custom SMTP if no email arrived.',
      status: 403,
    };
  }

  if (code === 'invalid_credentials') {
    return {
      kind: 'invalid_credentials',
      message: 'The email or password is incorrect.',
      status: 401,
    };
  }

  if (code === 'over_request_rate_limit' || error.status === 429) {
    return {
      kind: 'rate_limited',
      message: 'Too many sign-in attempts were made from this connection. Wait a few minutes before trying again.',
      status: 429,
      retryAfterSeconds: 180,
    };
  }

  if (error.status && error.status >= 500) {
    return {
      kind: 'service_unavailable',
      message: 'Supabase Auth is temporarily unavailable.',
      status: 503,
    };
  }

  return {
    kind: 'unknown',
    message: 'Sign in could not be completed. Verify the credentials and Supabase Auth configuration.',
    status: 400,
  };
}
