# Production signup email

Tessarion uses Supabase Auth for account creation. Supabase's default email delivery is suitable for initial testing, not sustained production signup traffic.

## Required production setup

Configure a custom SMTP provider in **Supabase → Authentication → SMTP Settings**. Keep provider credentials outside the repository.

After configuration, verify:

1. A valid external email can sign up.
2. Confirmation email delivery succeeds.
3. A repeated click does not create duplicate requests.
4. Rate-limited responses produce a bounded cooldown message.
5. Existing-account and invalid-address errors are distinguishable.
6. Production and localhost redirect URLs are allow-listed.

The frontend validates format before submission, preserves entered values after failure, disables duplicate submission, and applies a short cooldown after HTTP 429 responses. The API normalises provider errors rather than exposing raw service messages.
