import { describe, expect, it } from 'vitest';

import { isUnsupportedTestEmail, normalizeLoginError, normalizeSignupError } from './auth-error';

describe('authentication error normalization', () => {
  it('rejects test and example domains before calling the provider', () => {
    expect(isUnsupportedTestEmail('dhruv@test.com')).toBe(true);
    expect(isUnsupportedTestEmail('learner@example.com')).toBe(true);
    expect(isUnsupportedTestEmail('learner@domain.test')).toBe(true);
    expect(isUnsupportedTestEmail('learner@gmail.com')).toBe(false);
  });

  it('maps stable Supabase signup codes', () => {
    expect(normalizeSignupError({ code: 'email_address_invalid', status: 400 }).kind).toBe('invalid_email');
    expect(normalizeSignupError({ code: 'email_address_not_authorized', status: 400 }).kind).toBe('delivery_unavailable');
    expect(normalizeSignupError({ code: 'over_email_send_rate_limit', status: 429 }).kind).toBe('rate_limited');
    expect(normalizeSignupError({ code: 'weak_password', status: 422 }).kind).toBe('weak_password');
  });

  it('maps stable Supabase login codes', () => {
    expect(normalizeLoginError({ code: 'invalid_credentials', status: 400 }).kind).toBe('invalid_credentials');
    expect(normalizeLoginError({ code: 'email_not_confirmed', status: 400 }).kind).toBe('email_not_confirmed');
    expect(normalizeLoginError({ code: 'over_request_rate_limit', status: 429 }).kind).toBe('rate_limited');
  });
});
