# Tessarion production deployment

## Production topology

| Component | Target | Responsibility |
|---|---|---|
| Next.js application | Vercel | Public site, authenticated workspace, API routes, Inngest endpoint, health routes |
| Canonical data and authentication | Supabase | Users, profiles, notebooks, sources, concepts, learning records, checkpoints, RLS |
| Durable jobs | Inngest Cloud | Background processing, retries, schedules, and execution history |
| Retrieval projection | Qdrant Cloud | Workspace-filtered dense and sparse indexes |
| Graph projection | Neo4j AuraDB | Bounded concept traversal derived from canonical records |
| Trace inspection | Arize AX | Authenticated OTLP traces for workflows, tools, retrieval, and failures |

Supabase is the only canonical owner. Qdrant, Neo4j, Inngest run history, and Arize traces are operational or derived state.

## Deployment order

1. Create the hosted Supabase project.
2. Push all timestamped migrations with `supabase db push`.
3. Configure Supabase Auth URLs and production SMTP or disable confirmation for controlled testing.
4. Deploy the Git repository to Vercel using Node.js 24, `npm ci`, and `npm run build`.
5. Create and bootstrap Qdrant Cloud.
6. Create and bootstrap Neo4j AuraDB.
7. Install the Inngest Vercel integration and sync `/api/inngest` on the stable production domain.
8. Configure Arize AX credentials and send the first validation trace.
9. Run the production validation guide.

## Environment variables

### Required application variables

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
TESSARION_APP_URL
GOOGLE_GENERATIVE_AI_API_KEY
```

### Qdrant

```text
QDRANT_URL
QDRANT_API_KEY
QDRANT_COLLECTION=tessarion_workspace_chunks_v1
QDRANT_DENSE_VECTOR_SIZE=768
```

### Neo4j AuraDB

The current adapter uses the HTTPS Query API. Convert the downloaded Aura URI from `neo4j+s://host` to `https://host`.

```text
NEO4J_URI=https://<aura-host>
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<instance-password>
NEO4J_DATABASE=neo4j
```

### Inngest

```text
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
INNGEST_SERVE_ORIGIN=https://<stable-production-domain>
```

The serve origin excludes `/api/inngest`. Sync the complete endpoint separately:

```text
https://<stable-production-domain>/api/inngest
```

### Arize AX

Arize AX creates the tracing project automatically when the first accepted trace includes `openinference.project.name=tessarion`.

```text
ARIZE_SPACE_ID
ARIZE_API_KEY
ARIZE_PROJECT_NAME=tessarion
ARIZE_OTLP_ENDPOINT=https://otlp.arize.com/v1/traces
OTEL_SERVICE_NAME=tessarion
```

Use the regional OTLP endpoint when the Arize space is outside the US region.

## Infrastructure bootstrap and validation

The scripts automatically load `.env.local` under Node.js 24:

```cmd
npm run infra:bootstrap
npm run infra:validate
```

A healthy configured environment reports Supabase, Qdrant, Neo4j, and Arize as healthy. Missing optional infrastructure must degrade safely rather than crash canonical learner flows.

## Vercel routes

```text
/api/health
/api/health/infrastructure
/api/inngest
/api/mcp
```

`/api/mcp` remains disabled until `MCP_SERVER_TOKEN` is configured. The detailed infrastructure route may be protected with `INFRASTRUCTURE_HEALTH_TOKEN`; this token is optional and does not affect product operation.

## Release checks

Run locally:

```cmd
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run eval:release-v1
npm run deploy:check
npm run build
npm run infra:validate
```

Then complete [`PRODUCTION-VALIDATION.md`](PRODUCTION-VALIDATION.md) against the deployed application.

## Rollback

- **Vercel:** promote the previous healthy deployment.
- **Supabase:** use forward corrective migrations; do not edit migration history manually.
- **Qdrant:** recreate the collection and reindex from canonical source chunks.
- **Neo4j:** delete and rebuild the affected workspace projection.
- **Inngest:** disable or roll back the function deployment; preserve idempotency keys.
- **Arize AX:** disable export without blocking the learner workflow.
