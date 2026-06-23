# Nonprofit Control Tower — Roadmap

Self-contained, Cursor + gstack-ready specs. Each file in this folder is a standalone module you can hand to any agentic coding tool (Cursor, Claude Code, Lovable, Codex) without it needing access to other projects or this repo's history.

## How to use

1. Open the file for the module you want to build.
2. Copy the **Cursor handoff prompt** at the bottom.
3. In Cursor (or any agent), paste it and run the gstack flow:
   - `/plan-eng-review` → produce the engineering plan
   - Build the code from the plan
   - `/review` → pre-merge audit
   - `/ship` → pre-deploy checklist
   - `/document-release` → update docs

Every module spec follows the same 11-section template — see `templates/module-spec-template.md`.

## Reading order

1. `00-vision-and-icp.md` — product vision and ICP
2. `01-architecture-baseline.md` — stack, conventions, RLS/GRANT rules
3. Walk phases 1 → 4 in order; within a phase modules are independent.

## Phases

| Phase | Theme | Why this order |
|---|---|---|
| 1. Foundation | Service layer, portability, demo seed, persona switcher | Unblocks the 30-min remix story |
| 2. Named agents | 6 flagship agents, each tied to one KPI | Sells outcomes, not "AI" |
| 3. Portability | CRM / email / payment adapters, self-host guide | Cloud or client-Supabase |
| 4. Marketplace & compliance | Module marketplace, Form 990, PII guardrails, onboarding wizard | Long-term moat |

## Conventions every spec assumes

- React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Supabase (Postgres + RLS + Edge Functions on Deno)
- React Query for data; React Hook Form + Zod for forms
- Path alias: `@` → `./src`
- Dev port: 8080
- Naming: PascalCase components, camelCase hooks/utils, snake_case tables, kebab-case edge fns
- Every public table needs **RLS + explicit `GRANT`** in the same migration
- Roles in a separate `user_roles` table, checked via `has_role(uid, role)`
- AI calls go through Lovable AI Gateway in edge functions; default model `google/gemini-3-flash-preview`
