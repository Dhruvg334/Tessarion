# Production signup email

Tessarion uses Supabase Auth for account creation. Supabase's built-in email sender is intended for initial testing. It can send only to authorised team addresses and applies a project-wide email limit. Production registration requires custom SMTP.

## Production setup

1. Open **Supabase → Authentication → SMTP Settings**.
2. Enable custom SMTP.
3. Enter the host, port, username, password, sender address, and sender name from the selected email provider.
4. Keep SMTP credentials outside the repository.
5. Add the production Vercel URL and localhost URL under **Authentication → URL Configuration**.
6. Test confirmation, redirect, sign-in, and resend behaviour with an inbox you control.

## Temporary deployment testing

When SMTP is not ready, email confirmation can be disabled temporarily under **Authentication → Providers → Email**. Re-enable confirmation before public registration unless password-only accounts are an intentional product decision.

## Application behaviour

The signup interface:

- validates email format before sending a request;
- preserves the entered email after failure;
- prevents duplicate submissions;
- starts a cooldown after HTTP 429;
- distinguishes invalid address, existing account, weak password, rate limit, and delivery failure;
- does not expose raw provider errors.

After custom SMTP is configured, verify:

1. A valid external address can sign up.
2. Confirmation mail is delivered.
3. Confirmation returns to the production domain.
4. Repeated clicks do not create duplicate requests.
5. Existing-account and invalid-address errors remain distinct.
6. Password reset uses the same production redirect configuration.
