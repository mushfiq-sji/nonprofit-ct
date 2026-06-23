# Phase 1 · 04 — Migration Bundle Export

## 1. Goal
Produce a single `bundle.sql` file containing schema + seed that a self-hoster can paste into their Supabase SQL editor and have a working backend.

## 2. User story
As a **self-hosting customer**, I want **one SQL file to apply**, so that **I do not need the Supabase CLI to get started**.

## 3. KPI moved
- Self-host setup time: **2h → 15 min**

## 4. Scope (IN)
- `scripts/export-migrations.sh` — concatenates `supabase/migrations/*.sql` (skipping any that already ran on Lovable Cloud) and appends a seed block
- Output: `dist/bundle.sql` (gitignored), plus a checksum
- README section: "Self-host: apply `bundle.sql` in Supabase → SQL editor → Run"

## 5. Out of scope (OUT)
- A graphical migration runner
- Multi-database support (Postgres-only)

## 6. Files to create / change
```
scripts/export-migrations.sh          (new, executable)
.gitignore                            (add dist/)
README.md                             (add self-host section pointing to Phase 3 · 06 guide)
```

## 7. Data model
None — this is tooling.

## 8. API surface
Shell:
```bash
./scripts/export-migrations.sh
# → produces dist/bundle.sql and dist/bundle.sql.sha256
```

## 9. UI spec
None.

## 10. Acceptance criteria
- [ ] Script produces a single SQL file
- [ ] Applying `bundle.sql` to a fresh Postgres creates every table with RLS + GRANT
- [ ] Checksum is reproducible across runs (deterministic concat order)
- [ ] README documents usage

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-1-foundation/04-migration-bundle-export.md

Write the bash script and update README. Verify by running against a fresh local Postgres (or a throwaway Supabase project) and confirming the schema applies cleanly.

No app code changes. Run /review and /ship when done.
```
