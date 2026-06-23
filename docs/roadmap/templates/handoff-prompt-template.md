# Cursor / Agent Handoff Prompt — Generic

Paste this at the top of any Cursor / Claude Code / Lovable session before pointing at a spec.

```
PROJECT: Nonprofit Control Tower
STACK: React 18 + TypeScript + Vite + Tailwind v3 + shadcn/ui + React Router v6 + TanStack React Query v5 + React Hook Form + Zod
BACKEND: Supabase (Postgres + Row Level Security + Deno Edge Functions)
AI: Lovable AI Gateway via AI SDK (`npm:ai`, `@ai-sdk/openai-compatible`); default model `google/gemini-3-flash-preview`; key `LOVABLE_API_KEY` (server-only); baseURL `https://ai.gateway.lovable.dev/v1`; header `Lovable-API-Key`.
DEV PORT: 8080

CONVENTIONS (read docs/roadmap/01-architecture-baseline.md for the full list):
- PascalCase components, camelCase hooks/utils, snake_case tables, kebab-case edge fns
- Path alias `@` → `./src`
- Every CREATE TABLE in public schema: GRANT → ALTER ENABLE RLS → CREATE POLICY in the SAME migration
- Roles in separate `user_roles` table; check via `has_role(auth.uid(), 'admin')`
- All data access in `src/services/<domain>.service.ts` — never call `supabase.from(...)` from components
- Forms: React Hook Form + Zod
- Validate edge-function input with Zod, return 400 on failure
- Validate JWT via `supabase.auth.getClaims(token)`
- Include CORS headers on every edge function response
- Activity log mutations via `src/lib/activity-logger.ts`

GSTACK FLOW (run in order):
1. /plan-eng-review  — produce engineering plan from the spec
2. Build code from the plan
3. /review            — pre-merge audit
4. /ship              — pre-deploy checklist
5. /document-release  — update docs after deploy

TASK: implement the spec at docs/roadmap/<path>.md exactly. Do not invent tables or routes beyond what it lists. When done, post the acceptance-criteria checklist filled in.
```
