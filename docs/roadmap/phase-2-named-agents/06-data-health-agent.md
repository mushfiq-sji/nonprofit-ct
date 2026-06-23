# Data Health Agent

## 1. Agent identity
- **Name**: Data Health Agent
- **One-liner**: Scans donors, donations, members, and events for missing/duplicate/stale data and proposes fixes.
- **KPI moved**: Clean record %
- **Owning role**: Operations Manager

## 2. Inputs
| Field | Type | Source |
|---|---|---|
| scope | enum: `donors`, `donations`, `members`, `events`, `all` | UI |

## 3. Outputs
```ts
{
  scope: string,
  total_records: number,
  issues: Array<{
    record_id: string,
    table: string,
    issue_type: 'missing_email' | 'duplicate_donor' | 'no_address' | 'stale_contact' | 'invalid_phone' | 'orphan_donation' | 'other',
    severity: 'low' | 'med' | 'high',
    suggested_fix: string,
    auto_fixable: boolean
  }>,
  clean_pct: number,
  fixed_now: number   // when called with apply=true
}
```

## 4. System prompt
```
You are the Data Health Agent. Inspect the passed records for completeness, duplicates, and staleness. Classify each issue with a severity and a clear suggested fix. Mark obvious fixes (trim whitespace, lowercase email, deduplicate by exact email+name match) as auto_fixable.
```

## 5. Tools
- `applyAutoFixes(issue_ids: string[])` — server-side, only when caller sets `apply: true` AND has admin role

## 6. Files
```
supabase/functions/data-health-agent/index.ts
src/services/agents.service.ts            (add runDataHealth())
src/components/agents/DataHealthCard.tsx
src/pages/agents/DataHealthDetail.tsx
```

## 7. Data
- Reads: all `nonprofit_*` tables in scope
- Writes: `ai_agent_runs`, `data_health_findings`

```sql
CREATE TABLE public.data_health_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  record_id TEXT NOT NULL,
  source_table TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  suggested_fix TEXT,
  auto_fixable BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open', -- open | fixed | ignored
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_health_findings TO authenticated;
GRANT ALL ON public.data_health_findings TO service_role;
ALTER TABLE public.data_health_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own findings" ON public.data_health_findings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## 8. UI contract
- **Card** (OM dashboard): clean % + open issues count + "Scan now"
- **Detail** `/agents/data-health`:
  - Tabs: All / High / Medium / Low
  - Per-row: record link, issue, severity, suggested fix, "Apply fix" (only if auto_fixable)
  - "Apply all auto-fixable" bulk button (admin only)

## 9. Acceptance criteria
- [ ] Card on OM dashboard
- [ ] Scan persists issues to `data_health_findings`
- [ ] Auto-fix applies and marks status=fixed
- [ ] Non-admin cannot bulk-apply (server-side check)
- [ ] Activity logged

## 10. Cursor handoff prompt
```
TASK: docs/roadmap/phase-2-named-agents/06-data-health-agent.md
Follow base + agent template specs. Server MUST re-check has_role for auto-fix operations.
Run gstack.
```
