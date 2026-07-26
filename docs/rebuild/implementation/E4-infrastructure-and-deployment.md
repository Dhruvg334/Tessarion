# E4 — Infrastructure and deployment readiness

## Delivered

- Local Compose topology for Qdrant, Neo4j and Phoenix.
- Central server-only infrastructure configuration contract.
- Public liveness endpoint and optionally protected dependency-health endpoint.
- Supabase, Qdrant, Neo4j and Phoenix bounded health checks.
- Inngest App Router serve endpoint.
- Bearer-protected MCP HTTP endpoint built on the approved typed tool registry.
- Infrastructure validation command.
- Node 24 alignment across local, CI and Vercel deployment metadata.
- Production deployment guide and service-responsibility matrix.

## Safety boundaries

- Health responses never include credentials or raw service errors.
- MCP is disabled until a strong server token is configured.
- MCP calls require explicit user and workspace scope.
- Qdrant and Neo4j remain derived infrastructure.
- Public liveness does not query downstream services.
- Infrastructure health can be protected with a bearer token.

## Local commands

```cmd
npm run infra:up
npm run infra:status
npm run infra:bootstrap
npm run infra:validate
npm run infra:down
```

Supabase continues to run through the Supabase CLI and is deliberately not duplicated in Compose.
