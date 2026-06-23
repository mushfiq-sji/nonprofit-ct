# Volunteer Scheduler Agent

## 1. Agent identity
- **Name**: Volunteer Scheduler Agent
- **One-liner**: Auto-fills open volunteer shifts by matching volunteers' skills, availability, and history.
- **KPI moved**: Shift fill rate %
- **Owning role**: Operations Manager

## 2. Inputs
| Field | Type | Source |
|---|---|---|
| shift_ids | uuid[] (default: all open in next 14d) | UI / default |
| volunteer pool | from DB | `nonprofit_volunteers` |

## 3. Outputs
```ts
{
  assignments: Array<{
    shift_id: string,
    volunteer_id: string,
    volunteer_name: string,
    rationale: string,
    confidence: number
  }>,
  unfilled_shifts: Array<{ shift_id: string, reason: string }>,
  outreach_drafts: Array<{ volunteer_id: string, channel: 'email' | 'sms', message: string }>
}
```

## 4. System prompt
```
You are the Volunteer Scheduler Agent. Match volunteers to open shifts using skills, availability windows, and prior reliability (no-show rate). Do not double-book. Draft a short, friendly outreach message for each suggested assignment. If a shift cannot be filled, explain why so the operations manager can recruit.
```

## 5. Tools
None — single-shot with structured output. Reliability comes from passed-in stats.

## 6. Files
```
supabase/functions/volunteer-scheduler-agent/index.ts
src/services/agents.service.ts            (add runVolunteerScheduler())
src/components/agents/VolunteerSchedulerCard.tsx
src/pages/agents/VolunteerSchedulerDetail.tsx
```

## 7. Data
- Reads: `nonprofit_volunteer_shifts` (open), `nonprofit_volunteers` (skills, availability)
- Writes: proposed assignments to `nonprofit_volunteer_shifts.proposed_volunteer_id` (jsonb column or new fields — add via migration), `ai_agent_runs`

```sql
ALTER TABLE public.nonprofit_volunteer_shifts
  ADD COLUMN IF NOT EXISTS proposed_volunteer_id UUID,
  ADD COLUMN IF NOT EXISTS proposal_rationale TEXT,
  ADD COLUMN IF NOT EXISTS proposed_at TIMESTAMPTZ;
```

## 8. UI contract
- **Card** (OM dashboard): fill rate + "Auto-fill next 14 days" button
- **Detail** `/agents/volunteer-scheduler`:
  - Table of shifts × proposed volunteer × confidence
  - Bulk "Accept all" + per-row Accept/Reject
  - Outreach preview drawer

## 9. Acceptance criteria
- [ ] Card on OM dashboard
- [ ] Run produces assignments for open shifts in demo data
- [ ] Accepting an assignment writes the final volunteer_id and clears proposal fields
- [ ] Activity logged

## 10. Cursor handoff prompt
```
TASK: docs/roadmap/phase-2-named-agents/05-volunteer-scheduler-agent.md
Follow base + agent template specs. Run gstack.
```
