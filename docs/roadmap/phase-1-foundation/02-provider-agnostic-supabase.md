# Phase 1 · 02 — Provider-Agnostic Supabase Init

## 1. Goal
Read Supabase URL and publishable key from env vars. If missing, show a friendly setup screen with copy-pasteable instructions instead of a white screen.

## 2. User story
As a **self-hosting customer**, I want **a clear setup screen when env vars are missing**, so that **I know exactly what to paste into my `.env`**.

## 3. KPI moved
- Self-host setup failures resolved without support ticket: **+50%**

## 4. Scope (IN)
- `src/lib/supabase-config.ts` reads `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (preferred) or legacy `VITE_SUPABASE_ANON_KEY`
- New `<SetupGate>` component shown when either is missing; explains how to set them
- `app_config.deployment_mode` row (`cloud` | `self_host`) detected from a runtime ping
- README "Self-host in 5 steps" section

## 5. Out of scope (OUT)
- Bringing your own Postgres (covered in Phase 3)
- Migration runner UI (Phase 1 · 04)

## 6. Files to create / change
```
src/lib/supabase-config.ts            (new)
src/components/SetupGate.tsx          (new)
src/main.tsx                          (wrap App with SetupGate)
src/integrations/supabase/client.ts   (DO NOT edit — auto-gen; read env via supabase-config helper)
README.md                             (add "Self-host in 5 steps")
```

## 7. Data model
```sql
-- app_config already exists. Ensure these keys exist:
INSERT INTO public.app_config (key, value)
VALUES ('deployment_mode', '"cloud"'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

## 8. API surface
None.

## 9. UI spec
**SetupGate** — full-screen card when env is missing:
- Title: "Supabase connection needed"
- Body: code block of `.env` template
- 3 numbered steps: create Supabase project → copy URL + publishable key → paste into `.env` and restart
- Link to Phase 3 self-host guide

States: missing-url, missing-key, both-present → render `<App />`.

## 10. Acceptance criteria
- [ ] Deleting `VITE_SUPABASE_URL` shows SetupGate, not a crash
- [ ] Both vars present → app boots normally
- [ ] README has the 5-step section
- [ ] `npm run build` passes with both vars

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-1-foundation/02-provider-agnostic-supabase.md

Implement the SetupGate and config helper exactly as the spec says. Do NOT edit src/integrations/supabase/client.ts — that file is auto-generated; create a separate helper.

Test by: temporarily renaming VITE_SUPABASE_URL in your env; the app should render the SetupGate, not crash.

Run gstack: /plan-eng-review → build → /review → /ship.
```
