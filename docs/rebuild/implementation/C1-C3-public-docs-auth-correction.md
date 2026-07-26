# C1-C3 Public Interface, Documentation, and Auth Correction

## Design method

The public interface uses a tokenized CSS system with composition-oriented layout utilities and Radix Primitives as the accessibility layer for interactive product controls. Public and documentation pages remain server-rendered and dependency-light.

## Corrections

- Removed the page-wide notebook/noise treatment.
- Changed the public palette to pale cream surfaces and charcoal text.
- Made the public header fixed with an explicit content offset.
- Replaced the landing hero with one centered Tessarion wordmark and no tagline.
- Reduced heading, subtitle, navigation, and card type scales.
- Added the Next.js smooth-scroll declaration to the root element.
- Moved browser authentication calls behind same-origin server route handlers so Supabase connectivity failures return bounded JSON errors rather than repeated browser SDK failures.
- Redirected `/how-it-works` to a structured `/docs` system.

## Documentation routes

- `/docs`
- `/docs/architecture`
- `/docs/source-pipeline`
- `/docs/hybrid-rag`
- `/docs/knowledge-graph`
- `/docs/agent-orchestration`
- `/docs/teach-back`
- `/docs/mastery-model`
- `/docs/socratic-tutoring`
- `/docs/evaluation`
- `/docs/observability`
- `/docs/security`
- `/docs/current-status`

The docs shell has a centered category bar, a persistent page navigation, implementation-status labels, structured process blocks, and previous/next navigation.
