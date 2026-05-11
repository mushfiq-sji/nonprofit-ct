---
name: retro
description: Weekly engineering retrospective. Analyzes commit history, shipping velocity, quality signals, and work patterns. Run in Claude.ai every Friday.
triggers:
  - retro
  - weekly retro
  - retrospective
  - how did we do this week
  - shipping review
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# /retro — Weekly Engineering Retrospective

Run in **Claude.ai** every Friday (or Claude Code Desktop with git access). Reviews the past 7 days.

## Step 1: Gather Data

```bash
# Commits in the last 7 days
git log --oneline --since="7 days ago" --format="%h %an %s"

# Top changed files
git log --since="7 days ago" --name-only --format="" | sort | uniq -c | sort -rn | head -20

# Commit type distribution
git log --oneline --since="7 days ago" | grep -oP '^[a-z0-9]+ [a-z]+(?=[:!])' | awk '{print $2}' | sort | uniq -c | sort -rn

# Edge Functions changed
git log --since="7 days ago" --oneline -- "supabase/functions/"

# Migrations applied
git log --since="7 days ago" --oneline -- "supabase/migrations/"

# LOC delta
git diff --shortstat HEAD~7 HEAD 2>/dev/null || echo "(fewer than 7 commits)"
```

## Step 2: Metrics Table

| Metric | Value |
|--------|-------|
| Commits (7 days) | |
| Features shipped (`feat:`) | |
| Bugs fixed (`fix:`) | |
| Migrations applied | |
| Edge Functions modified | |
| Top changed file | |

## Step 3: Quality Signals

Run the two gates and note results:

```bash
npm run lint 2>&1 | tail -5
npm run build:dev 2>&1 | tail -10
```

| Signal | Status |
|--------|--------|
| Lint | PASS / FAIL / warnings count |
| Build | PASS / FAIL |
| TypeScript `any` count | `grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | wc -l` |

## Step 4: Shipping Velocity Analysis

- Commits per day (7-day average)
- Feature vs fix ratio (healthy: features > fixes)
- Largest single commit — flag if it touches 20+ files (risky blast radius)
- Any commits marked WIP, TEMP, or TODO that need cleanup

## Step 5: Work Pattern Insights

```bash
git log --since="7 days ago" --format="%cd" --date=format:"%H" | sort | uniq -c | sort -rn | head -5
```

Peak coding hours — informational, not evaluative.

## Step 6: Per-Contributor Section

For each contributor in the 7-day window:
- **Specific praise** anchored in actual commit messages (name the feature)
- **One growth opportunity** framed as an investment worth making (not a criticism)
- Modules/files they owned this week

## Step 7: Tweetable Summary

One sentence capturing the week's most important shipping outcome.

## Step 8: Next Week's Priority

Ask via `AskUserQuestion`: What's the one thing that must ship next week?

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEEKLY RETRO — [YYYY-MM-DD]
[Product Name] — [Branch/Repo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 SHIPPED THIS WEEK
[Tweetable summary]

📊 METRICS
[Table]

🔍 QUALITY
[Lint/build/any-type counts]

⚡ VELOCITY
[Commits/day, feature:fix ratio, blast radius flags]

👥 TEAM
[Per-contributor section with specific praise + one growth area]

🎯 NEXT WEEK
[Top priority from AskUserQuestion]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Tone

Specific and earned. Name actual commits and features. No generic feedback. Growth suggestions are investments worth making, not criticisms. Every praise statement must reference an actual commit or file.
