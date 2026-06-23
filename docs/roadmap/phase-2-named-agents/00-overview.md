# Phase 2 — Named Agents

**Goal**: stop selling "AI". Sell 6 named agents that each own one workflow and move one KPI.

## Why this phase
Generic agent browse pages don't convert. A specific agent ("Donor Retention Agent saved $4,200 of lapsed donors last month") sells itself.

## The 6 agents

| # | Agent | Owning role | KPI moved |
|---|---|---|---|
| 1 | Donor Retention Agent | DD | Lapsed-donor recovery $ |
| 2 | Grant Writer Agent | ED / DD | Drafts shipped per month |
| 3 | Board Reporter Agent | ED | Days to board pack |
| 4 | Event ROI Agent | DD | $ raised per event hour |
| 5 | Volunteer Scheduler Agent | OM | Shift fill rate % |
| 6 | Data Health Agent | OM | Clean records % |

## Shared contract
Every agent follows `templates/agent-spec-template.md`. Common rules:
- Server-side prompt (never leak to client)
- Result is JSON matching a Zod schema
- Every run logs to `ai_agent_runs`
- Card on the role dashboard shows: KPI value, last-run timestamp, "Run now" button
- Detail page shows run history + latest output
- Default model: `google/gemini-3-flash-preview` via Lovable AI Gateway

## Sequencing
All 6 can be built in parallel after Phase 1. Suggested order by ROI:
1. Donor Retention (fastest demo win)
2. Board Reporter (highest ED pain)
3. Grant Writer
4. Event ROI
5. Data Health
6. Volunteer Scheduler
