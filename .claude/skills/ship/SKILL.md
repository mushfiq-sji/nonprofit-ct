---
name: ship
description: Pre-production push checklist. Runs lint, build, reviews code, verifies plan completion, bumps version, commits, pushes, and creates PR. Run in Claude Code Desktop before any staging or production push.
triggers:
  - ship
  - ready to push
  - pre-push checklist
  - production push
  - staging push
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
---

# /ship — Pre-Production Push

Run in **Claude Code Desktop** before any staging or production push. Non-interactive by default — runs straight through unless a gate fails.

## Idempotent

Re-running `/ship` re-runs all verification steps but won't create duplicate PRs or double-bump versions.

## Stage 1: Pre-flight

```bash
git status
git log --oneline -5
git diff main...HEAD --stat
```

Show diff summary. Check whether `/plan-eng-review` and `/review` have been run for this branch.

## Stage 2: Lint Gate (Hard Stop)

```bash
npm run lint
```

If lint fails, stop and fix before proceeding. Do not suppress with `eslint-disable` without a documented reason.

## Stage 3: Build Gate (Hard Stop)

```bash
npm run build:dev
```

If build fails, stop and fix. TypeScript errors must be resolved — never `@ts-ignore` without a comment explaining why.

## Stage 4: Type Safety Pre-Commit Check

Read `.claude/PRE_COMMIT_CHECKLIST.md` and verify all 6 sections:
1. Supabase queries → TypeScript types aligned
2. TypeScript completeness (no missing Record keys, no duplicate exports)
3. Filter types → query methods correct
4. Mutation callbacks defined in `useMutation()`, not `mutate()`
5. Join type audits complete
6. Enum usage updated across all Record maps

## Stage 5: Code Review Pass

Run the `code-reviewer` agent on changed files. Check for:
- Module placement violations (wrong `src/` directory)
- Missing RLS policies on new tables
- `any` types introduced
- Missing cache key invalidation after mutations
- CORS headers missing from new Edge Functions
- Hardcoded secrets or env vars in client code
- Missing `logCrud()` / `logLogin()` calls where expected

## Stage 6: Plan Completion Check

If there's a spec or plan file for this feature, verify all items are implemented. Flag any NOT DONE items via `AskUserQuestion` before proceeding — implement or defer with a TODO.

## Stage 7: Edge Function Deploy Check

If Edge Functions were modified or created:
```bash
git diff main...HEAD --name-only | grep "supabase/functions/"
```

List which functions need deploying. Output deploy commands but do not run them automatically — deployment requires Supabase CLI access.

```bash
# For each modified function:
supabase functions deploy <function-name>
```

## Stage 8: Migration Check

If new migrations exist:
```bash
git diff main...HEAD --name-only | grep "supabase/migrations/"
```

Verify migrations have RLS policies for all new tables. Output migration notes for the PR body.

## Stage 9: Version Bump

Check `package.json` version. Propose bump via `AskUserQuestion`:
- **patch** (x.x.+1): bug fixes, minor UI changes
- **minor** (x.+1.0): new features, new modules
- **major** (+1.0.0): breaking changes, architecture shifts

## Stage 10: Commit & Push

```bash
git add <specific files>  # Never git add -A
git commit -m "[type]: [description]"
git push -u origin <branch>
```

## Stage 11: Create PR

Generate PR with:
- Title: `[type]: [what changed]` (under 70 chars)
- Body: Summary, Edge Functions to deploy, migrations to run, test plan
- Draft: Yes (unless explicitly ready for review)

## Gates Summary

| Gate | Blocking? | Resolution |
|------|-----------|------------|
| `npm run lint` fails | **Yes** | Fix before proceeding |
| `npm run build:dev` fails | **Yes** | Fix before proceeding |
| TypeScript errors | **Yes** | Fix or document with justification |
| Plan items NOT DONE | Ask user | Implement or defer with TODO |
| Code review findings | Ask user | Fix trivial; judge complex |
| Missing RLS on new tables | Ask user | Add policy or confirm intentional |
| Missing migrations | Ask user | Create or confirm intentional |
