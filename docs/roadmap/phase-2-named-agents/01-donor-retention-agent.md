# Donor Retention Agent

## 1. Agent identity
- **Name**: Donor Retention Agent
- **One-liner**: Flags lapsed and at-risk donors with a specific re-engagement action.
- **KPI moved**: Lapsed-donor recovery $ per month
- **Owning role**: Development Director

## 2. Inputs
| Field | Type | Source |
|---|---|---|
| lookback_days | int (default 365) | UI |
| at_risk_threshold_days | int (default 120) | UI |
| donor rows | from DB | `nonprofit_donations` joined to donor identity |

## 3. Outputs (JSON, Zod-validated)
```ts
{
  summary: string,          // markdown
  risk_buckets: { lapsed: number, at_risk: number, healthy: number },
  actions: Array<{
    donor_id: string,
    donor_name: string,
    last_gift_date: string,
    last_gift_amount: number,
    bucket: 'lapsed' | 'at_risk',
    recommended_action: 'call' | 'email' | 'letter',
    suggested_message: string,
    confidence: number      // 0-1
  }>,
  kpi_delta: { potential_recovery_usd: number }
}
```

## 4. System prompt
```
You are the Donor Retention Agent for a small/mid nonprofit.
Given a list of donors with their gift history, classify each as lapsed (no gift in lookback_days), at_risk (no gift in at_risk_threshold_days), or healthy.
For each lapsed/at_risk donor, recommend exactly one of: call, email, letter — based on gift size and recency.
Draft a 2-sentence personalized message for each.
Return JSON matching the provided schema. Never invent donor names or amounts.
```

## 5. Tools
None — single-shot generation with structured output.

## 6. Files
```
supabase/functions/donor-retention-agent/index.ts   (already exists as donor-churn-risk — alias or rename)
src/services/agents.service.ts                      (add runDonorRetention())
src/components/agents/DonorRetentionCard.tsx
src/pages/agents/DonorRetentionDetail.tsx
src/components/agents/DonorActionDrawer.tsx
```

## 7. Data
- Reads: `nonprofit_donations`, donor identity (from CRM adapter — Phase 3 — or seed data)
- Writes: `ai_agent_runs` (input, output, kpi_delta)
- Logs: `logActivity('agent_run', { agent: 'donor_retention', kpi_delta })`

## 8. UI contract
- **Dashboard card** (DD dashboard): KPI = "$X potential recovery", subline = lapsed/at-risk counts, button "Run now", link "View details"
- **Detail page** `/agents/donor-retention`:
  - Header: KPI + last run timestamp
  - Action drawer: table of donors with checkbox to mark "contacted"
  - History tab: last 10 runs with delta

## 9. Failure handling
Standard 4xx/5xx + 402 credits / 429 rate limit.

## 10. Acceptance criteria
- [ ] Card on DD dashboard
- [ ] "Run now" → progress → result in < 15s for 100-donor demo set
- [ ] Output validated by Zod; malformed model output handled with toast + retry
- [ ] Run logged with kpi_delta.potential_recovery_usd
- [ ] "Mark contacted" updates donor (writes to a `donor_outreach_log` table — create if missing per template)
- [ ] Activity logged

## 11. Cursor handoff prompt
```
TASK: Implement the Donor Retention Agent per docs/roadmap/phase-2-named-agents/01-donor-retention-agent.md.

Stack & conventions: docs/roadmap/01-architecture-baseline.md.
Agent template rules: docs/roadmap/templates/agent-spec-template.md.

Use Lovable AI Gateway (`google/gemini-3-flash-preview`). Structured output via AI SDK `Output.object` with a Zod schema. Log to ai_agent_runs.

Run gstack: /plan-eng-review → build → /review → /ship → /document-release.
```
