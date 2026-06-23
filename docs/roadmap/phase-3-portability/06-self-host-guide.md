# Self-Host Guide

## 1. Goal
A single `docs/SELF_HOST.md` that gets a technical-enough customer from `git clone` to running app in under 30 minutes against their own Supabase.

## 2. User story
As a **nonprofit's IT consultant**, I want **a 5-step guide**, so that **I can host this app on the customer's infrastructure without calling support**.

## 3. KPI moved
- Self-host conversions per month
- Support tickets per self-host install: **target < 1**

## 4. Scope (IN)
Author `docs/SELF_HOST.md` with these exact sections:
1. **Prerequisites** — Node 20+, npm, a Supabase project (cloud or self-hosted), an AI key (Lovable AI or compatible)
2. **Clone & install**
3. **Configure env** — `.env` template with the 5 required vars
4. **Apply database** — paste `dist/bundle.sql` in Supabase SQL editor (built by Phase 1 · 04)
5. **Boot** — `npm run dev`, sign in as ED demo persona, run reset-demo to repopulate

## 5. Out of scope (OUT)
- Kubernetes / Docker images
- HA / multi-region

## 6. Files
```
docs/SELF_HOST.md                     (new)
.env.example                          (new — 5 vars: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, LOVABLE_API_KEY, plus optional email/SMS)
README.md                             (link to SELF_HOST.md)
```

## 7. The 5 env vars
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
LOVABLE_API_KEY=                # required for AI features; can swap for compatible gateway
SENDGRID_API_KEY=               # optional; or set RESEND_API_KEY / MAILGUN_API_KEY
SUPABASE_SERVICE_ROLE_KEY=      # server-only; needed only for one-shot seeders
```

## 8. Acceptance criteria
- [ ] `docs/SELF_HOST.md` exists and follows the 5-section structure
- [ ] `.env.example` exists with the 5 vars and comments
- [ ] A clean test run (fresh Supabase + fresh checkout) succeeds in < 30 min
- [ ] Guide includes a troubleshooting section for the top 5 expected errors

## 9. Cursor handoff prompt
```
TASK: docs/roadmap/phase-3-portability/06-self-host-guide.md

Write docs/SELF_HOST.md following the 5-section structure exactly. Create .env.example. Add a link from README.md.

Then run through the guide yourself against a fresh Supabase project. Fix anything that wasn't obvious. Time-box the run at 30 minutes — if it takes longer, simplify the guide.
```
