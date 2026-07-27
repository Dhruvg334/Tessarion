# Tessarion deployment guide

## Production topology

| Component | Deployment target | Responsibility |
|---|---|---|
| Next.js application | Vercel | Public site, authenticated workspace, API routes, MCP endpoint, health routes, Inngest serve endpoint |
| Canonical database, auth, storage | Supabase hosted project | Users, workspaces, sources, concepts, learning records, workflow checkpoints, RLS |
| Durable jobs | Inngest Cloud | Document processing, retries, scheduled and asynchronous work |
| Dense and sparse retrieval | Qdrant Cloud | Rebuildable vector and sparse indexes, always filtered by workspace |
| Graph projection | Neo4j AuraDB | Rebuildable concept traversal projection |
| Trace inspection | Phoenix Cloud or Phoenix on Render | OTLP-compatible workflow, retrieval and tool traces |

No service other than Supabase owns canonical learner data. Qdrant, Neo4j and Phoenix may be rebuilt or removed without invalidating the transactional records.

## 1. Supabase

1. Create a hosted Supabase project.
2. Apply every file under `supabase/migrations/` in timestamp order using the Supabase CLI.
3. Configure the site URL and redirect URLs for the Vercel production and preview domains.
4. Copy the project URL, publishable/anon key and service-role key into Vercel.
5. Confirm RLS is enabled before importing any learner data.

Recommended deployment command from a trusted workstation or CI environment:

```cmd
supabase link --project-ref <project-ref>
supabase db push
```

Do not expose the service-role key to the browser.

## 2. Qdrant Cloud

Create a Qdrant Cloud cluster and set:

```text
QDRANT_URL=https://<cluster-endpoint>
QDRANT_API_KEY=<server-only-key>
QDRANT_COLLECTION=tessarion_workspace_chunks_v1
QDRANT_DENSE_VECTOR_SIZE=<embedding-dimension>
```

The application creates the collection through the existing Qdrant adapter. The collection is derived state. Reindex from canonical source chunks after changing embedding dimensions or models.

## 3. Neo4j AuraDB

Create an AuraDB instance and set:

```text
NEO4J_URI=https://<query-api-host>
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<database-password>
NEO4J_DATABASE=neo4j
```

Tessarion currently uses Neo4j's HTTP Query API. Neo4j is a derived projection; Postgres remains authoritative for concept IDs and canonical relationships.

## 4. Inngest Cloud

The deployed application serves functions at:

```text
https://<vercel-domain>/api/inngest
```

Create an Inngest application, sync this URL and configure:

```text
INNGEST_EVENT_KEY=<event-key>
INNGEST_SIGNING_KEY=<signing-key>
```

The first deployed function is intentionally limited. Expand it only with idempotent, checkpointed steps and bounded retries.

## 5. Phoenix tracing

For the fastest hosted deployment, use Phoenix Cloud and configure its OTLP endpoint. For self-hosting, deploy the `arizephoenix/phoenix` image to a Render web service:

- Runtime: Existing Docker image
- Image: `docker.io/arizephoenix/phoenix:latest`
- Region: Singapore when it matches the rest of the stack
- Health check: `/healthz`
- Container port: `6006`
- Persistent disk mount: `/mnt/data`

Then configure:

```text
PHOENIX_URL=https://<phoenix-service>
PHOENIX_COLLECTOR_ENDPOINT=https://<phoenix-service>/v1/traces
OTEL_SERVICE_NAME=tessarion
```

Pin the Phoenix image to a tested version or digest before a production release.

## 6. Vercel

Import the GitHub repository into Vercel.

- Framework: Next.js
- Node.js: 24.x
- Install command: `npm ci`
- Build command: `npm run build`
- Health endpoint: `/api/health`

Set all production variables from `.env.example`. Mark server credentials as sensitive. The following routes are deployed with the Next.js application:

```text
/api/inngest
/api/mcp
/api/health
/api/health/infrastructure
```

`/api/mcp` remains disabled until `MCP_SERVER_TOKEN` is configured. The infrastructure health route can be protected with `INFRASTRUCTURE_HEALTH_TOKEN`.

## 7. Render responsibilities

Tessarion does not currently require a separate application worker on Render. Inngest's HTTP handler is served from Vercel. Use Render only for Phoenix self-hosting at this stage.

Move heavy indexing or graph-synchronization workers to a Render background worker later only when execution time, memory, or connection requirements exceed Vercel function limits. That worker should consume Inngest events and use the same canonical service contracts.

## 8. Release order

1. Deploy Supabase and apply migrations.
2. Create Qdrant and Neo4j services.
3. Deploy Phoenix or configure Phoenix Cloud.
4. Configure Vercel environment variables.
5. Deploy the Vercel project.
6. Sync `/api/inngest` with Inngest Cloud.
7. Call `/api/health`.
8. Call the protected `/api/health/infrastructure` route.
9. Complete one source-to-teach-back flow using a non-production test workspace.
10. Verify traces and then remove the test records.

## 9. Rollback

- Vercel: redeploy the previous successful build.
- Supabase: use forward corrective migrations; do not delete applied production migrations.
- Qdrant: recreate the collection and reindex from Postgres.
- Neo4j: remove and rebuild the affected workspace projection.
- Phoenix: rollback to the previously tested image digest.

## Arize AX tracing

Arize AX projects are created automatically when the first accepted trace arrives with an `openinference.project.name` resource attribute. Tessarion uses `ARIZE_PROJECT_NAME=tessarion`; there is no separate project-creation step in the AX interface.

Configure these server-only values locally and in Vercel Production:

```text
ARIZE_SPACE_ID=<space-id>
ARIZE_API_KEY=<api-key>
ARIZE_PROJECT_NAME=tessarion
ARIZE_OTLP_ENDPOINT=https://otlp.arize.com/v1/traces
OTEL_SERVICE_NAME=tessarion
```

For EU or Canada spaces, use the regional OTLP endpoint documented by Arize. The exporter sends `arize-space-id` and `arize-api-key` headers and includes both `service.name` and `openinference.project.name` resource attributes. Trace-export failures are isolated from the learner workflow.
