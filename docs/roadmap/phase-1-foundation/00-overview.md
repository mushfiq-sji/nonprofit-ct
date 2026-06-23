# Phase 1 — Foundation for Remix

**Goal**: a stranger can remix the project → boot → see a working demo in under 30 minutes, on Lovable Cloud or their own Supabase.

## Why this phase first
Nothing else matters if remixing is painful. Phase 1 makes the codebase portable, seedable, and demoable out of the box.

## Modules in this phase
1. **01 — Service layer refactor** — move every `supabase.from(...)` out of components/hooks into `src/services/*.service.ts`
2. **02 — Provider-agnostic Supabase init** — read URL/keys from env, show a setup screen if missing
3. **03 — Seed on boot** — auto-seed demo data + 4 role users the first time the app loads
4. **04 — Migration bundle export** — produce one SQL file a self-hoster can apply
5. **05 — Sidebar cleanup** — hide legacy/non-nonprofit modules behind a flag
6. **06 — Demo persona switcher** — 1-click sign-in as ED / DD / FM / OM
7. **07 — Reset demo button** — wipe nonprofit_* tables and reseed

## Sequencing
Build 01 first (every other module depends on it). 02–07 can run in parallel after 01 lands.

## Definition of done for the phase
- Fresh remix → page loads with seed data in < 30 min
- README in repo root has "Self-host in 5 steps" section
- Persona switcher works for ED/DD/FM/OM with no manual user creation
- All `supabase.from(...)` calls live in `src/services/`
