# Phase 1 · 07 — Reset Demo Button

## 1. Goal
An admin-only button that wipes all `nonprofit_*` tables and re-runs the seeder, so demos can be reset to a known-good state in 10 seconds.

## 2. User story
As an **admin running a demo**, I want **to reset all demo data to its starting state**, so that **the next prospect sees the canonical experience**.

## 3. KPI moved
- Demo reset time: **manual SQL session → 1 click**

## 4. Scope (IN)
- Admin → Settings → "Reset demo data" button (with confirm dialog)
- Edge function `reset-demo-data` truncates `nonprofit_*` tables and `ai_agent_runs` (demo runs only) then re-invokes `seed-on-boot` with `force: true`
- Refuses unless caller has admin role AND `app_config.demo_mode = true`

## 5. Out of scope (OUT)
- Selective reset (per-table)
- Backups before reset

## 6. Files to create / change
```
supabase/functions/reset-demo-data/index.ts    (new)
src/pages/admin/Settings.tsx                   (add Reset card)
src/services/admin.service.ts                  (add resetDemoData())
```

## 7. Data model
No new tables. Function truncates:
```
nonprofit_donations, nonprofit_campaigns, nonprofit_donors_pipeline (if exists),
nonprofit_members, nonprofit_volunteers, nonprofit_volunteer_shifts,
nonprofit_events, nonprofit_event_registrants, nonprofit_event_ticket_types,
nonprofit_event_speakers, nonprofit_event_agenda_items,
nonprofit_programs
```
(adjust to actual table list at implementation time)

## 8. API surface
**POST** `/reset-demo-data`
- Auth: admin JWT required, server re-checks `has_role(sub, 'admin')`
- Request: `{}` (no body)
- Response: `{ ok: true, truncated: 12, reseeded: { ... } }`
- Errors: 401, 403 (not admin), 409 (demo_mode off)

## 9. UI spec
- Card title: "Demo data"
- Body: "Wipes all donor, donation, event, member, volunteer, and program data. Reseeds from the canonical demo set."
- Button: red, "Reset demo data"
- Confirm dialog: "Type RESET to confirm"
- Toast on success: "Demo data reset"

## 10. Acceptance criteria
- [ ] Non-admin cannot see button
- [ ] Non-admin call to edge fn returns 403
- [ ] When demo_mode off, returns 409
- [ ] Successful reset leaves DB identical to first-boot state
- [ ] Activity logged

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-1-foundation/07-reset-demo-button.md

Implement edge fn and admin UI. The function must double-check role server-side via has_role. Use service-role to TRUNCATE then invoke seed-on-boot with { force: true }.

Confirm dialog must require typing "RESET". CORS, Zod validation, activity log.
```
