# Phase 1 · 06 — Demo Persona Switcher

## 1. Goal
A top-nav widget that lets anyone sign in as ED / DD / FM / OM with one click — no password typing — so demos and remix walkthroughs are frictionless.

## 2. User story
As a **prospect evaluating the product**, I want **to switch between role dashboards in one click**, so that **I see the value for every persona without creating accounts**.

## 3. KPI moved
- Time to see all 4 dashboards in a demo: **5 min → 30 sec**

## 4. Scope (IN)
- Top-nav dropdown "Switch persona" → ED / DD / FM / OM / Admin
- Edge function `demo-quick-login` returns a session for the chosen persona
- Only enabled when `app_config.demo_mode = true` (default true on Lovable Cloud; default false in self-host)
- Shown only on demo users; hidden once a real org overrides

## 5. Out of scope (OUT)
- Production SSO
- Multi-tenant impersonation

## 6. Files to create / change
```
supabase/functions/demo-quick-login/index.ts   (new)
src/components/layout/PersonaSwitcher.tsx      (new)
src/components/layout/TopNav.tsx               (mount PersonaSwitcher)
src/services/auth.service.ts                   (add quickLogin(persona))
```

## 7. Data model
```sql
INSERT INTO public.app_config (key, value)
VALUES ('demo_mode', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

## 8. API surface
**POST** `/demo-quick-login`
- Auth: anon allowed when `demo_mode = true`
- Request: `{ persona: 'ed' | 'dd' | 'fm' | 'om' | 'admin' }`
- Response: `{ access_token, refresh_token, user }`
- Errors: 403 when demo_mode is off, 404 when persona user not found

Implementation: server uses service-role key to mint a session via `auth.admin.generateLink({ type: 'magiclink' })` then exchange OR `auth.admin.createSession()`. Pick whichever the current Supabase JS version supports; otherwise sign in with the documented demo password stored as edge-fn secret.

## 9. UI spec
- Dropdown with 5 items, each showing role icon + name + one-line description
- After click: replaces session, navigates to that role's dashboard
- Toast: "Signed in as Executive Director"
- Hidden when `demo_mode = false`

## 10. Acceptance criteria
- [ ] Dropdown appears in demo mode
- [ ] Each click signs in and lands on correct dashboard
- [ ] Disabled / hidden when demo_mode flag is off
- [ ] Function refuses requests when flag is off (defense in depth)
- [ ] Activity logged: `logActivity('persona_switch', { persona })`

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-1-foundation/06-demo-persona-switcher.md

Implement the persona switcher. Use Supabase admin API in the edge function (service-role key already in secrets as SUPABASE_SERVICE_ROLE_KEY).

Security: the function MUST refuse when app_config.demo_mode = false, even if the UI is hidden. CORS headers on every response. Validate input with Zod.

Follow service-layer rule: client calls auth.service.ts → service calls edge fn.
```
