---
name: document-release
description: Post-deploy documentation sync. Reads all project docs, cross-references the diff, and updates CLAUDE.md / README / docs/ to match what shipped. Run in Claude Code Desktop after every deploy, same session.
triggers:
  - document release
  - update docs after ship
  - post-ship docs
  - sync documentation
  - document what changed
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
---

# /document-release — Post-Deploy Documentation Sync

Run in **Claude Code Desktop** after every deploy, in the same session. Never let docs drift from code.

## Step 1: Pre-flight & Diff Analysis

```bash
git log --oneline -10
git diff main...HEAD --name-only
```

Classify changed files:
- **Auto-update**: Factual changes (new route, renamed export, new env var, new table name, new Edge Function)
- **Ask user**: Narrative changes (architectural decisions, rationale, new module description)

## Step 2: Per-File Audit

Check these files against the diff:

| File | What to update |
|------|---------------|
| `CLAUDE.md` | New modules, new commands, new env vars, new Edge Functions, changed routes, new agents |
| `README.md` | Setup changes, new features visible to external developers |
| `AGENTS.md` | If agent roster or coordination rules changed |
| `.claude/agents.md` | If agent delegation rules changed |
| `docs/02-modules/` | Per-module docs matching what shipped |
| `docs/08-edge-functions/` | New Edge Functions listed |
| `.env.example` | New env vars documented |
| `supabase/config.toml` | New Edge Functions have JWT setting |

## Step 3: Apply Auto-Updates

Use `Edit` (not `Write`) for all updates. One edit per logical change so diffs are readable.

**Never:**
- Overwrite entire files with rewritten versions
- Remove existing content that is still accurate
- Change the voice or structure of existing sections

## Step 4: Ask About Risky Changes

For any change requiring narrative judgment, use `AskUserQuestion` with:
- What changed in the code
- What the doc currently says
- Proposed update
- Why it's a judgment call

## Step 5: CHANGELOG

If `CHANGELOG.md` exists:
- Add new entry at the top: `## [version] — YYYY-MM-DD`
- List: features added, bugs fixed, Edge Functions deployed, migrations applied
- **Never** rewrite or remove existing entries
- **Never** auto-generate the full changelog from commits — write it human-readable

## Step 6: Cross-Doc Consistency Check

- Version numbers match across `package.json` and any version references
- New routes documented in `docs/02-modules/`
- New Edge Functions listed in `docs/08-edge-functions/`
- New env vars in `.env.example` and documented in `CLAUDE.md`
- New modules registered in `src/shared/config/modules.ts` and documented

## Step 7: Commit

```bash
git add CLAUDE.md README.md AGENTS.md docs/ .env.example
git commit -m "docs: sync documentation after [feature] deploy"
```

Do not push separately — this commit goes on the same branch as the feature.

## Stack-Specific Checks After Any Deploy

- [ ] `supabase/config.toml` — new Edge Functions have JWT setting documented
- [ ] `src/shared/config/modules.ts` — new modules registered and documented
- [ ] `.env.example` — new env vars present with comments
- [ ] `docs/08-edge-functions/` — new functions listed with purpose
- [ ] `docs/02-modules/` — new module pages created if applicable

## Important Rules

- Read every file before editing it
- Never clobber CHANGELOG entries
- Never bump VERSION silently — always ask via `AskUserQuestion`
- Be explicit about what changed and why
- If unsure whether a doc change is accurate, ask the user
