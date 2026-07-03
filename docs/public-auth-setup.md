# Local Auth Setup

To test Tessarion locally with real authentication, you need to configure your environment to talk to a Supabase project. 
Tessarion uses `@supabase/ssr` to securely handle user sessions across client components, route handlers, and middleware.

## Requirements

1. **Supabase Project:** You must have a Supabase project running (either local docker or cloud instance).
2. **Email Auth Enabled:** Ensure the Email/Password authentication provider is enabled in your Supabase Auth settings.
3. **Environment Variables:** You must configure `.env.local` at the root of the project.

Create `.env.local` and add the following keys. Do NOT commit your actual secrets.

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```
*(Note: `SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not leak it into `NEXT_PUBLIC_`)*

## Email Confirmation Behavior

By default, Supabase requires users to confirm their email before logging in. In a local testing environment, this can be tedious.

**Option 1: Disable Email Confirmation (Recommended for local dev)**
1. Go to your Supabase Dashboard > Authentication > Providers > Email
2. Toggle off "Confirm email"
3. In this mode, signing up in Tessarion will immediately redirect you to the `/dashboard`.

**Option 2: Use Email Confirmation**
1. Keep "Confirm email" enabled.
2. If using Supabase local (CLI), check the Inbucket console (usually `http://localhost:54324`) to grab the confirmation link.
3. In this mode, signing up in Tessarion will display a message: "Check your email for the confirmation link."

## Manual Test Flow

To verify auth works properly:
1. Ensure you are signed out.
2. Visit `/` and `/demo` (these should load without redirecting).
3. Visit `/dashboard` (this should redirect you to `/login?next=/dashboard`).
4. Sign up via `/signup`. (If email confirmation is off, you will land on `/dashboard`).
5. Verify `/dashboard` and `/workspace/[id]` are accessible.
6. Create a workspace, open it, paste source material, extract concepts, and start a teach-back session.
7. Click the **Log out** button in the header. You should be redirected to `/login` and unable to access `/dashboard`.
