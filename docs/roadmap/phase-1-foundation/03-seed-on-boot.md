# Phase 1 · 03 — Seed on Boot

## 1. Goal
On a fresh install, automatically create 4 demo users (ED, DD, FM, OM) and populate every nonprofit_* table with realistic demo data, so a remixer sees a live app on first load.

## 2. User story
As a **new remixer**, I want **the app to come pre-populated with a believable nonprofit's data**, so that **I can click around and understand the product in 5 minutes**.

## 3. KPI moved
- Time from remix click to first "wow" moment: **15 min → 2 min**
- 30-day activation: **+20pp**

## 4. Scope (IN)
- Edge function `seed-on-boot` (idempotent) that:
  - Creates 4 users via Supabase admin API if missing
  - Assigns each a role in `user_roles`
  - Inserts demo data from `src/shared/data/nonprofitDemoData.ts` into `nonprofit_*` tables
  - Sets `app_config.seeded = true`
- Client-side check on app boot: if `app_config.seeded = false`, call the function
- Admin "Reseed demo data" button (see module 07)

## 5. Out of scope (OUT)
- Production data import (Phase 3 CSV adapter)
- Multi-tenant seeding

## 6. Files to create / change
```
supabase/functions/seed-on-boot/index.ts        (new)
src/services/bootstrap.service.ts               (new — calls the function)
src/main.tsx                                    (call bootstrap.service.checkAndSeed() once)
src/shared/data/nonprofitDemoData.ts            (extend with 4 user profiles)
```

## 7. Data model
```sql
-- Ensure app_config keys
INSERT INTO public.app_config (key, value) VALUES
  ('seeded', 'false'::jsonb),
  ('seeded_at', 'null'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

## 8. API surface
**POST** `/seed-on-boot`
- Auth: requires service-role (server-to-server) OR an admin JWT
- Request: `{ force?: boolean }`
- Response: `{ ok: true, created: { users: 4, donors: 50, donations: 120, ... } }`
- Idempotent: if `app_config.seeded = true` and `force` is false, returns `{ ok: true, skipped: true }`

## 9. UI spec
- No new pages; runs invisibly on first boot
- Toast on success: "Demo data ready — try logging in as Executive Director"
- Persona switcher (module 06) becomes visible

## 10. Acceptance criteria
- [ ] First boot of a fresh DB creates 4 users + demo rows
- [ ] Second boot does nothing (`skipped: true`)
- [ ] All 4 users can sign in with documented passwords
- [ ] Every role dashboard renders non-empty
- [ ] Function is idempotent under concurrent calls

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-1-foundation/03-seed-on-boot.md

Create the seed-on-boot edge function. Use Supabase admin API (service-role key from env) to create users idempotently. Use the demo data already in src/shared/data/nonprofitDemoData.ts — extend it with 4 demo personas (ED, DD, FM, OM with documented test passwords).

The function MUST be idempotent. Guard with `app_config.seeded`.

CORS headers on every response. Validate input with Zod. Follow rules in docs/roadmap/01-architecture-baseline.md.

Run gstack flow.
```
