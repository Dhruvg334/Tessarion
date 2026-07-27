# Production authentication and email

Tessarion uses Supabase Auth directly from the browser through `@supabase/ssr`. Login and signup requests no longer pass through a shared Vercel API route, so Supabase can apply client/IP limits to the actual browser rather than to a shared serverless egress address.

## Why the first signup may still be rate-limited

Supabase has two different limits:

- `over_request_rate_limit`: too many Auth requests from one client/IP. Tessarion shows a temporary cooldown for this case.
- `over_email_send_rate_limit`: the project email quota is exhausted. Tessarion does not show a misleading one-minute countdown for this case because the built-in sender is limited project-wide and may take much longer to reset.

The built-in Supabase email service is intended only for initial testing. It can send only to authorised organisation addresses and currently has a very small project-wide quota. A public deployment must either configure custom SMTP or intentionally disable email confirmation.

## Option A — immediate deployment testing

1. Open **Supabase → Authentication → Providers → Email**.
2. Temporarily disable **Confirm email**.
3. Delete incomplete test users under **Authentication → Users**.
4. Test signup with a real inbox and a new password.
5. Confirm that signup immediately creates a session and redirects to `/dashboard`.

This is acceptable for controlled testing. Re-enable confirmation before public registration unless password-only accounts are an intentional product decision.

## Option B — production registration

1. Choose an SMTP provider such as Resend, Brevo, Postmark, Mailgun or Amazon SES.
2. Open **Supabase → Authentication → SMTP Settings**.
3. Enter the SMTP host, port, username, password, sender address and sender name.
4. Open **Authentication → Rate Limits** and review the email-send quota after SMTP is active.
5. Keep credentials outside the repository.
6. Add the production domain and localhost under **Authentication → URL Configuration**.
7. Disable link tracking in the SMTP provider when it rewrites confirmation links.

## Redirect configuration

Use the exact production domain:

```text
Site URL: https://YOUR-VERCEL-DOMAIN
Redirect URLs:
https://YOUR-VERCEL-DOMAIN/**
http://localhost:3000/**
```

Tessarion sends confirmation links to:

```text
/auth/callback?next=/dashboard
```

The callback exchanges the Supabase PKCE code for a session and redirects to the requested safe path.

## Verification

1. Sign up using a real inbox.
2. Confirm the email when confirmation is enabled.
3. Confirm the callback returns to the production domain.
4. Verify `/dashboard` loads.
5. Log out and sign in again.
6. Check Supabase **Auth Logs** for the stable error code if any step fails.
7. Confirm repeated button clicks do not create duplicate requests.
