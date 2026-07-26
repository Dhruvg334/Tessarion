# E2 — Performance and Route Hardening

## Scope

This pass removes avoidable work from authenticated navigation and makes the Next.js 16 authentication boundary explicit.

## Changes

- Workspace data is now loaded by active panel. Sources no longer trigger review, tutoring, graph, and teach-back-history reads; review and tutor panels likewise avoid unrelated projections.
- The Study Board remains the only surface that intentionally loads the complete notebook summary.
- The deprecated `middleware.ts` convention is replaced by `proxy.ts`.
- Protected-route redirects preserve both pathname and query string.
- Missing authentication configuration produces one bounded redirect instead of repeated browser refresh attempts.
- A deterministic performance quality gate protects panel-scoped loading, public-shell isolation, proxy usage, and absence of tutor polling.

## Verification

```cmd
npm run lint
npm run typecheck
npm run test:run
npm run eval:performance
npm run eval:integration
npm run build
```

Performance must also be checked from a production build. Development-mode first requests include route compilation and are not representative of steady-state production latency.
