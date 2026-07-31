# Security policy

## Supported version

| Version | Supported |
|---|---|
| 1.0.x | Yes |
| Earlier development versions | No |

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability.

Report security concerns privately through the repository owner’s GitHub profile or GitHub Security Advisories when available. Include:

- the affected route, component, or workflow;
- reproduction steps;
- expected and observed behaviour;
- the potential impact;
- any relevant request IDs or safe logs;
- a suggested mitigation, when known.

Do not include passwords, session cookies, service-role keys, provider keys, database credentials, or other secrets in the report.

## Security boundaries

Tessarion applies these release boundaries:

- Supabase/Postgres is the canonical store for users and learner records.
- Row-level security and server-side authorization scope private data by user and workspace.
- Qdrant and Neo4j contain rebuildable derived data and require `workspaceId` isolation.
- Inngest functions use signed requests, bounded retries, and idempotency controls.
- Arize AX receives safe operational spans rather than raw credentials or hidden reasoning.
- Service-role, provider, database, tracing, and signing credentials remain server-only.
- Public demo routes are deterministic and do not write account data.

## Secrets

Never commit:

- `.env.local` or other environment files;
- Supabase service-role keys;
- Qdrant API keys;
- Neo4j passwords;
- Inngest signing or event keys;
- Arize API keys or Space IDs;
- MCP or infrastructure-health bearer tokens.

If a secret is exposed, rotate it at the provider immediately, update the deployment environment, redeploy, and review logs for misuse.
