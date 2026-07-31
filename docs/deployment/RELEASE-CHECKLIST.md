# Tessarion v1.0.0 release checklist

## Source and repository

- [ ] Working tree is clean.
- [ ] `.env.local` and provider credentials are untracked.
- [ ] `package.json` and `package-lock.json` report version `1.0.0`.
- [ ] README, changelog, security policy, and deployment documentation match production.
- [ ] No unrelated or temporary media is embedded.

## Automated gates

Run with Node.js 24:

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

Required result:

- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Unit and regression tests pass.
- [ ] Frozen release evaluation passes.
- [ ] Deployment readiness passes.
- [ ] Production build passes.
- [ ] Supabase, Qdrant, Neo4j, and Arize report healthy locally.
- [ ] GitHub Actions passes on `main`.
- [ ] Vercel production deployment is Ready.

## Production workflow

- [ ] Signup and login work with the configured Supabase email policy.
- [ ] Session persists across public and authenticated pages.
- [ ] Profile updates persist.
- [ ] Notebook creation and navigation work.
- [ ] Source ingestion completes.
- [ ] Inngest run reaches Completed.
- [ ] Qdrant points are created with workspace payloads.
- [ ] Neo4j nodes and relationships are projected with workspace identifiers.
- [ ] Retrieval returns source-linked evidence.
- [ ] Teach-back diagnosis distinguishes correct coverage, omissions, unsupported claims, and misconceptions.
- [ ] Tutor asks one bounded question at a time.
- [ ] Review scheduling and completion work.
- [ ] Activity and trace views expose safe operational records.
- [ ] Arize AX receives the production trace.
- [ ] A second account cannot access the first account’s notebook.
- [ ] Logout removes access to protected routes.
- [ ] Public demo remains available without authentication and writes no account data.

## Release

```cmd
git tag -a v1.0.0 -m "Tessarion v1.0.0"
git push origin v1.0.0
```

Then create the GitHub release from `CHANGELOG.md` and attach no secrets, local environment files, database dumps, or private planning documents.
