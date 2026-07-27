import { describe, expect, it } from 'vitest';

import { normalizeLoginError, normalizeSignupError } from './auth-error';

describe('auth error normalization', () => {
  it('distinguishes the project email quota from an IP request limit', () => {
    expect(normalizeSignupError({ code: 'over_email_send_rate_limit', status: 429 })).toEqual({
      kind: 'rate_limited',
      message: 'The project email quota is currently exhausted. Configure custom SMTP or wait for the Supabase email quota to reset.',
      status: 429,
    });

    expect(normalizeSignupError({ code: 'over_request_rate_limit', status: 429 }).retryAfterSeconds).toBe(180);
  });

  it('maps stable Supabase signup codes', () => {
    expect(normalizeSignupError({ code: 'email_address_invalid' }).kind).toBe('invalid_email');
    expect(normalizeSignupError({ code: 'email_address_not_authorized' }).kind).toBe('delivery_unavailable');
    expect(normalizeSignupError({ code: 'weak_password' }).kind).toBe('weak_password');
  });

  it('maps stable Supabase login codes', () => {
    expect(normalizeLoginError({ code: 'email_not_confirmed' }).kind).toBe('email_not_confirmed');
    expect(normalizeLoginError({ code: 'invalid_credentials' }).kind).toBe('invalid_credentials');
  });
});
