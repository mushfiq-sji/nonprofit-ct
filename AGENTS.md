# AGENTS.md — Nonprofit Control Tower

This file guides AI agents (Claude Code, Codex, GPT-4, and others) working in this repository. Read it before writing any code.

## What This Project Is

Operational intelligence layer for modern nonprofits. Provides role-specific dashboards (Executive Director, Development Director, Finance Manager, Operations Manager), grants management, events, board reports, data health, reconciliation, AI agent teams, knowledge base, and meeting management.

**Brand**: NonprofitAI.software  
**Stack**: React 18 + TypeScript + Vite + Supabase + shadcn/ui  
**Backend**: Supabase Edge Functions (Deno), PostgreSQL with RLS  
**Dev port**: 8080  
**Package manager**: npm

## Before You Write Any Code

1. Read `CLAUDE.md` — complete project rules and conventions
2. Run `npm run lint` — must pass before any commit
3. Run `npm run build:dev` — must pass before any commit
4. **No test runner is configured** — lint + build:dev are the only automated gates

## File Placement Rules

| What | Where |
|------|-------|
| New page | `src/pages/` + route in `src/modules/<name>/routes.tsx` |
| New component | `src/components/<domain>/` |
| New hook | `src/hooks/use<Name>.ts` |
| New util | `src/lib/<name>.ts` |
| New Edge Function | `supabase/functions/<kebab-case>/index.ts` |
| New migration | `supabase/migrations/` (via `npm run migrations:run`) |
| New module | `src/modules/<name>/` with `index.ts` + `routes.tsx` |

## Naming Conventions

| Context | Convention |
|---------|-----------|
| React components | PascalCase (`Dashboard.tsx`) |
| Hooks | `use` prefix + camelCase (`useClients.ts`) |
| Utilities | camelCase (`validation.ts`) |
| Database tables | snake_case (`user_roles`) |
| Edge Functions | kebab-case dirs (`ai-chat-assistant/`) |
| Env vars | `VITE_` prefix for client-side |

## Nonprofit-Specific Context

- Demo data lives in `src/shared/data/nonprofitDemoData.ts` — use it for static pages
- 4 role-specific dashboards: Executive Director, Development Director, Finance Manager, Operations Manager
- 16 AI agents across 4 teams defined in `src/components/ai/agentTeamConfig.ts`
- Navigation structure in `src/shared/data/navigationStructure.ts`
- Static nonprofit pages (`/grants`, `/events`, `/board-reports`, `/data-health`, `/reconciliation`) use demo data, no module gating

## The 11 Specialized Agents

All agents live in `.claude/agents/`. Delegate to them instead of doing everything in the orchestrator.

| Agent | Specialization | When to Use |
|-------|---------------|-------------|
| `react-frontend-dev` | Pages, components, hooks, routing | Any UI work |
| `supabase-backend-dev` | Edge Functions, migrations, RLS | Any backend/DB work |
| `code-reviewer` | Quality, conventions (read-only) | Before every PR |
| `debugger` | Bug investigation, error analysis | Any error or crash |
| `documentation-engineer` | Specs, API docs, module guides | Documentation work |
| `performance-engineer` | Bundle analysis, query profiling | Performance issues |
| `refactoring-specialist` | Safe restructuring, tech debt | Cleanup tasks |
| `security-auditor` | RLS audit, vulnerability detection (read-only) | Security features |
| `typescript-pro` | Type safety, `any` elimination | TypeScript issues |
| `test-automator` | Vitest setup, fixtures | Test writing |
| `edge-function-doctor` | Edge Function audit, CORS, 500 errors | All Edge Function work |

## Delegation Rules

**Auto-delegate without asking:**
- New page / component / hook → `react-frontend-dev`
- New Edge Function / migration / RLS policy → `supabase-backend-dev`
- Pre-merge review → `code-reviewer`
- Any bug → `debugger`
- Any `any` type or TypeScript error → `typescript-pro`
- 500 error or CORS issue → `edge-function-doctor`
- RLS policy change → `security-auditor`

**Safe to run in parallel** (different modules/layers):
- `react-frontend-dev` + `supabase-backend-dev` (UI + backend simultaneously)
- `documentation-engineer` + any implementation agent

## Hard Rules for All Agents

1. **RLS on all tables** — never bypass Row Level Security
2. **No secrets in client code** — use Edge Function environment variables
3. **Validate at boundaries** — Zod schemas for all user input (`src/lib/validation.ts`)
4. **XSS protection** — DOMPurify via `src/lib/sanitize.ts`
5. **No `git add -A`** — stage files explicitly by name
6. **No `--no-verify`** — never skip pre-commit hooks
7. **No `@ts-ignore`** without a comment explaining why
8. **CORS headers in every new Edge Function** — use `supabase/cors.ts`
9. **Activity logging** — use `logCrud()`, `logLogin()`, `logLogout()` from `src/lib/activity-logger.ts`

## gstack Build Flow

Follow this order for every feature:
1. `/plan-ceo-review` → Claude.ai (before any spec)
2. `/plan-eng-review` → Claude Code Desktop (spec + architecture)
3. `/design-consultation` → Claude.ai (new projects only)
4. Build → Lovable → Cowork QA pass
5. `/review` → Claude Code Desktop (before staging push)
6. `/ship` → Claude Code Desktop (before production push)
7. `/document-release` → Claude Code Desktop (after every deploy, same session)
8. `/retro` → Claude.ai (every Friday)

Skills live in `.claude/skills/`. See `CLAUDE.md` for the full gstack section.
