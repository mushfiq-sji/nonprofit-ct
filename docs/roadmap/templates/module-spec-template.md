# [Module Name]

> Copy this file for any new module spec. Replace bracketed placeholders.

## 1. Goal
One sentence outcome.

## 2. User story
As a **[role]**, I want **[outcome]** so that **[value]**.

## 3. KPI moved
Which number changes after this ships? (e.g. "time to first board pack: 5d → 30min")

## 4. Scope (IN)
- ...

## 5. Out of scope (OUT)
- ...

## 6. Files to create / change
```
src/services/<domain>.service.ts         (new)
src/hooks/useXxx.ts                      (new)
src/pages/XxxPage.tsx                    (new)
src/components/<domain>/XxxCard.tsx      (new)
supabase/functions/<name>/index.ts       (new)
supabase/migrations/<ts>_<name>.sql      (new)
```

## 7. Data model
```sql
CREATE TABLE public.<name> ( ... );
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<name> TO authenticated;
GRANT ALL ON public.<name> TO service_role;
ALTER TABLE public.<name> ENABLE ROW LEVEL SECURITY;
CREATE POLICY ... ;
```

## 8. API surface (edge function)
**POST** `/<name>`
- Request: `{ ... }`
- Response: `{ ... }`
- Errors: `400 validation`, `401 unauth`, `402 credits`, `429 rate`, `500 internal`

## 9. UI spec
- **Route**: `/xxx`
- **Components**: list with purpose
- **States**: empty / loading / error / success — copy for each
- **Accessibility**: keyboard, ARIA, color contrast

## 10. Acceptance criteria
- [ ] Migration runs cleanly with RLS + GRANT
- [ ] Service layer owns all `supabase.from(...)` calls
- [ ] Edge function validates input with Zod
- [ ] Page renders all 4 states
- [ ] Activity logged on mutation
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## 11. Cursor handoff prompt
```
You are working on the Nonprofit Control Tower — a React 18 + Vite + TypeScript + Tailwind + shadcn/ui app on Supabase (Postgres + RLS + Deno Edge Functions). Run the gstack flow: /plan-eng-review → build → /review → /ship → /document-release.

Read docs/roadmap/01-architecture-baseline.md for stack conventions, then implement docs/roadmap/<path-to-this-spec>.md exactly as written. Do not invent new tables or routes beyond what the spec lists. Follow the RLS + GRANT rules. Use the service-layer pattern from docs/roadmap/phase-1-foundation/01-service-layer-refactor.md.

When done, post the acceptance-criteria checklist filled in.
```
