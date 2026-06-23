# Event ROI Agent

## 1. Agent identity
- **Name**: Event ROI Agent
- **One-liner**: After every event, computes $ raised per staff hour and suggests next-event improvements.
- **KPI moved**: $ raised per event hour
- **Owning role**: Development Director

## 2. Inputs
| Field | Type | Source |
|---|---|---|
| event_id | uuid | `nonprofit_events` |
| staff_hours | number | UI (override) or sum from a future timesheet table |

## 3. Outputs
```ts
{
  event_name: string,
  gross_raised_usd: number,
  net_raised_usd: number,
  attendees: number,
  no_show_rate: number,
  cost_per_dollar_raised: number,
  dollars_per_staff_hour: number,
  improvements: string[],          // 3-5 actionable next-event tweaks
  follow_up_targets: Array<{ attendee_id: string, reason: string }>
}
```

## 4. System prompt
```
You are the Event ROI Agent. Given event registrations, donations attributed to the event, costs, and staff hours, compute ROI metrics. Identify the 3-5 highest-leverage changes for the next similar event. Flag attendees who gave above median or showed strong interest as follow-up targets.
```

## 5. Tools
None (single-shot with structured output) — unless cost breakdown grows, then add `getEventCosts(eventId)`.

## 6. Files
```
supabase/functions/event-roi-agent/index.ts        (event-intelligence exists — extend or alias)
src/services/agents.service.ts                     (add runEventROI())
src/components/agents/EventROICard.tsx
src/pages/agents/EventROIDetail.tsx
```

## 7. Data
- Reads: `nonprofit_events`, `nonprofit_event_registrants`, `nonprofit_donations` (filtered by campaign or event link)
- Writes: `ai_agent_runs`, `nonprofit_events.metadata.roi` (jsonb)

## 8. UI contract
- **Card**: most recent event's $/hour + "Analyze next event" button
- **Detail** `/agents/event-roi`:
  - Event picker
  - KPI grid (gross, net, attendees, no-show %, $/hour, cost/$ raised)
  - Improvements list
  - Follow-up targets list with one-click "add to outreach"

## 9. Acceptance criteria
- [ ] Card on DD dashboard
- [ ] Runs against any past event in demo data
- [ ] ROI persists on event row
- [ ] Follow-up targets are real attendee IDs
- [ ] Activity logged

## 10. Cursor handoff prompt
```
TASK: docs/roadmap/phase-2-named-agents/04-event-roi-agent.md
Follow base + agent template specs. Run gstack.
```
