# Vercel deployment

This guide deploys the Next.js application first, using hosted Supabase as the only required external dependency. Qdrant, Neo4j, Inngest, and trace export remain optional for the first healthy production deployment.

## 1. Pre-deployment checks

Run from the repository root:

```cmd
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run deploy:check
npm run build
```

`middleware.ts` must not exist. Next.js 16 uses `proxy.ts`.

## 2. Import the repository

1. Open Vercel and choose **Add New → Project**.
2. Import the Tessarion Git repository.
3. Keep the detected framework as **Next.js**.
4. Keep the root directory at the repository root.
5. Install command: `npm ci`.
6. Build command: `npm run build`.
7. Set Node.js to `24.x` in Project Settings.

## 3. Required environment variables

Add these to **Production**, **Preview**, and **Development** unless a value is intentionally environment-specific:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
TESSARION_APP_URL
```

For the first deployment, set `NEXT_PUBLIC_SITE_URL` and `TESSARION_APP_URL` to the production Vercel URL after Vercel assigns it, then redeploy.

Server-only variables must never use the `NEXT_PUBLIC_` prefix.

## 4. Recommended optional variables

Add these only when the relevant service is deployed:

```text
GOOGLE_GENERATIVE_AI_API_KEY
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
QDRANT_URL
QDRANT_API_KEY
QDRANT_COLLECTION
QDRANT_DENSE_VECTOR_SIZE
NEO4J_URI
NEO4J_USERNAME
NEO4J_PASSWORD
NEO4J_DATABASE
ARIZE_SPACE_ID
ARIZE_API_KEY
ARIZE_PROJECT_NAME
ARIZE_OTLP_ENDPOINT
OTEL_SERVICE_NAME
MCP_SERVER_TOKEN
INFRASTRUCTURE_HEALTH_TOKEN
```

The public site, documentation, public demo, authentication, canonical learner records, and deterministic local fallbacks do not require all optional integrations to be present.

## 5. Supabase Auth configuration

After the production domain is known:

1. Open Supabase **Authentication → URL Configuration**.
2. Set **Site URL** to the exact production URL.
3. Keep `http://localhost:3000/**` for local development.
4. Add the exact production URL and, if preview authentication is required, the Vercel preview wildcard for the account/team slug.

Prefer exact production redirect URLs over broad wildcards.

## 6. First deployment checks

Verify:

```text
GET /api/health                        → 200
GET /                                 → public landing page
GET /docs                             → consolidated documentation
GET /demo/notebook                    → public demo without login
GET /login                            → login page
GET /dashboard                        → redirects to login while signed out
```

Then verify the authenticated flow:

1. Sign up or log in.
2. Create a notebook.
3. Add pasted source material.
4. Reload and confirm persistence.
5. Open Sources, Knowledge graph, Teach-back, Tutor, Reviews, and Activity.
6. Confirm another account cannot open the workspace URL.

## 7. Production health states

- `/api/health` is the public liveness endpoint.
- `/api/health/infrastructure` is protected when `INFRASTRUCTURE_HEALTH_TOKEN` is configured.
- Missing optional services should appear as degraded or unavailable without breaking public routes or canonical Supabase operations.

## 8. Rollback

If a deployment fails:

1. Promote the previous healthy Vercel deployment.
2. Do not roll back database migrations by editing hosted tables manually.
3. Correct the repository migration or application issue in a new commit.
4. Run the complete local gate and deploy again.
