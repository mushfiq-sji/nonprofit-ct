---
name: plan-ceo-review
description: CEO-level adversarial review of any plan before implementation. Finds scope gaps, silent failures, and 10-star opportunities. Run in Claude.ai before writing specs.
triggers:
  - plan ceo review
  - ceo review
  - before any spec
  - review the plan
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
---

# /plan-ceo-review — CEO Plan Review

Run in **Claude.ai** (not Claude Code Desktop) before writing any spec or starting any feature.

## Purpose

Adversarial pre-implementation review. Finds what the plan is missing, what it gets wrong, and what could make it 10x better. Applies CEO-level judgment: reversibility, blast radius, focus-as-subtraction, and paranoid failure scanning.

## Step 0: Confirm Context

Ask for the plan or feature description if not provided. Check whether `/brainstorming` has already run — if not, run it first (or offer it). `/brainstorming` is the prerequisite skill that clarifies problem + intent before the review begins.

## Review Mode

Ask the user which mode to use:

| Mode | Behavior |
|------|----------|
| **SCOPE EXPANSION** | Dream big; propose ambitious additions one by one |
| **SELECTIVE EXPANSION** | Hold baseline scope, cherry-pick expansions |
| **HOLD SCOPE** | Maximum rigor on existing scope; no new features |
| **SCOPE REDUCTION** | Strip to minimum viable; ruthless cuts |

## 11 Review Sections (all mandatory)

Evaluate every section. If a section has zero findings, say so — never skip.

1. **Architecture & dependencies** — Is the data model right? Are dependencies justified? Does module placement follow `src/shared/config/modules.ts`?
2. **Error & rescue mapping** — What fails silently? What corrupts state? What can't be undone?
3. **Security & threat modeling** — RLS policies, input validation, XSS, SQL injection, auth edge cases
4. **Data flow & edge cases** — Race conditions, stale data, concurrent edits, empty states, React Query cache invalidation
5. **Code quality** — DRY violations, naming, module placement, tech debt introduced
6. **Test coverage** — What paths are untested? (Note: no test runner configured; lint + build:dev are gates)
7. **Performance** — N+1 queries, missing indexes, large payloads, React re-renders, missing `useMemo`/`useCallback`
8. **Observability** — How will you debug this in production? What logs exist? (`activity-logger.ts`)
9. **Deployment & rollout** — Edge function deploy, migration safety, zero-downtime, `supabase/config.toml` JWT config
10. **Long-term trajectory** — Does this create debt? Does it align with the module system? Feature flag needed?
11. **Design & UX** — If UI scope: does the user flow make sense? What's the 10-star version?

## Rules

- One `AskUserQuestion` per finding. Never write findings into the plan without user approval.
- Once a mode is chosen, stay in it.
- "AI makes completeness cheap" — when in doubt, recommend the full version (150 LOC at 100% coverage beats 80 LOC at 90%).
- Inversion reflex: ask "what would break us?" for every decision.
- Reversibility preference: can this be feature-flagged? Can we roll back the migration safely?

## Stack Context (SJ Innovation)

- React 18 + TypeScript + Vite + Supabase + shadcn/ui
- No test runner — gates are `npm run lint` + `npm run build:dev`
- Supabase Edge Functions (Deno) + PostgreSQL with RLS
- Module system: `src/shared/config/modules.ts`
- All forms: React Hook Form + Zod (`src/lib/validation.ts`)
- All data fetching: TanStack React Query with cache keys from `src/lib/cache.ts`
- 120+ Edge Functions in `supabase/functions/`, migrations in `supabase/migrations/`
