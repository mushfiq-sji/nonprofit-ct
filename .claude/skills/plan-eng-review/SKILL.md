---
name: plan-eng-review
description: Engineering manager review of spec + architecture before coding begins. Locks data flow, edge cases, and test plan into the spec. Run in Claude Code Desktop.
triggers:
  - plan eng review
  - engineering review
  - lock in the plan
  - tech review
  - architecture review
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
---

# /plan-eng-review — Engineering Plan Review

Run in **Claude Code Desktop** after `/plan-ceo-review` and before writing any code. Locks architecture, data flow, edge cases, and test plan into the spec.

## Step 0: Scope Gate

Read the plan or feature description. If it touches 8+ files or introduces 2+ new services/modules, ask:
1. Is the full scope necessary for the first iteration?
2. What's the smallest version that proves the concept?

Present the minimal version as an option before proceeding.

## Review Sections

### 1. Architecture Review

- Is the module placement correct? (`src/modules/`, `src/hooks/`, `src/lib/`, `supabase/functions/`)
- Are new database tables designed with RLS from day one?
- Does the data flow match the existing pattern (React Query → hook → component)?
- Are Edge Functions needed, or can the frontend call Supabase directly?
- What's the failure mode for each new code path?
- New binaries / packages: is there a distribution pipeline?

### 2. Code Quality Review

- DRY: is anything being reimplemented that already exists in `src/lib/`?
- Are new types following the Supabase auto-generated types pattern (`src/integrations/supabase/types.ts`)?
- Does naming follow conventions (PascalCase components, `use` prefix hooks, kebab-case Edge Functions)?
- Does it introduce `any` types? Flag all of them — use `typescript-pro` agent to resolve.
- Are cache keys following the `queryKeys` factory from `src/lib/cache.ts`?

### 3. Test Plan

No test runner is configured. Gates are:
```bash
npm run lint      # TypeScript + ESLint
npm run build:dev # Full build verification
```

Document which type safety patterns (from `.claude/skills/type-safety-patterns/SKILL.md`) apply to this change:
- Pattern #1: Query → Type Sync (every `.select()` field in type)
- Pattern #2: Record Exhaustiveness
- Pattern #3: Union Filter Types
- Pattern #4: Mutation Context Types
- Pattern #5: Partial Join Selects

ASCII coverage diagram showing:
- Every new code path and branch
- Every empty/zero/boundary condition
- Every error state visible to the user
- Every Supabase query return type alignment

### 4. Performance Review

- N+1 query risk in React Query hooks?
- Missing database indexes for new queries?
- Large payload risk from Supabase selects (use specific column lists, not `*`)?
- Unnecessary React re-renders from context changes?
- Edge Function cold start risk for user-facing flows?

## Per-Finding Rule

One `AskUserQuestion` per finding. Never silently apply "obvious fixes." User approval required before any finding lands in the plan.

## Parallelization Analysis

After review sections, identify whether implementation steps can run in parallel:
- `react-frontend-dev` + `supabase-backend-dev` can work simultaneously on different layers
- Flag any shared files that would cause merge conflicts

## Outputs

Update the spec/plan file with:
- "NOT in scope" section — work considered and deferred with rationale
- "What already exists" — existing code the plan reuses
- ASCII data flow diagram
- Failure modes per new code path
- Type safety checklist

## Engineering Heuristics

- **DRY over clever** — reuse `src/lib/`, `src/hooks/`, existing patterns
- **Boring by default** — don't introduce new dependencies without strong justification
- **Reversibility** — prefer feature-flagged rollouts over big bangs
- **Blast radius first** — evaluate every decision by worst-case affected systems
- **Explicit over clever** — clarity > compression

## Stack Context

- Module registry: `src/shared/config/modules.ts`
- Cache keys: `src/lib/cache.ts`
- Validation: `src/lib/validation.ts` (Zod)
- Auth middleware: `supabase/auth-middleware.ts`
- CORS: `supabase/cors.ts`
- 120+ Edge Functions in `supabase/functions/`
- Migrations in `supabase/migrations/`
