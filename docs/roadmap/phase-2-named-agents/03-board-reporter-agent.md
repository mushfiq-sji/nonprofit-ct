# Board Reporter Agent

## 1. Agent identity
- **Name**: Board Reporter Agent
- **One-liner**: Assembles a board-ready report in minutes from live donation, grant, program, and reconciliation data.
- **KPI moved**: Days from "start" to "send to board" — target 5 days → 30 minutes
- **Owning role**: Executive Director

## 2. Inputs
| Field | Type | Source |
|---|---|---|
| period_start | date | UI |
| period_end | date | UI |
| sections | string[] | UI (default: exec_summary, financials, programs, grants, risks, asks) |

## 3. Outputs
```ts
{
  title: string,
  period: { start: string, end: string },
  sections: Array<{
    heading: string,
    markdown: string,
    figures: Array<{ label: string, value: string }>
  }>,
  attachments_suggested: string[]   // e.g. "Q3 reconciliation export"
}
```

## 4. System prompt
```
You are the Board Reporter Agent. Produce a concise, board-ready report from the structured data passed in. Use plain English. Lead with the headline numbers. Highlight 1-3 risks and 1-3 specific asks of the board. Never invent figures — only use what was passed in.
```

## 5. Tools
Optional tools (if multi-step):
- `getDonationsRollup(start, end)`
- `getGrantPipeline()`
- `getReconciliationStatus()`
- `getProgramOutcomes(programId)`

Use `stepCountIs(50)`.

## 6. Files
```
supabase/functions/board-reporter-agent/index.ts
src/services/agents.service.ts                    (add runBoardReporter())
src/components/agents/BoardReporterCard.tsx
src/pages/agents/BoardReporterDetail.tsx
src/components/agents/BoardReportPreview.tsx     (already exists — reuse)
```

## 7. Data
- Reads: `nonprofit_donations`, `nonprofit_campaigns`, `nonprofit_programs`, `grant_drafts`, plus reconciliation tables
- Writes: `ai_agent_runs`, `board_reports`

```sql
CREATE TABLE public.board_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | sent
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_reports TO authenticated;
GRANT ALL ON public.board_reports TO service_role;
ALTER TABLE public.board_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own board reports" ON public.board_reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## 8. UI contract
- **Card** (ED dashboard): "Last report: <date>" + "Generate Q3 report" button
- **Detail** `/agents/board-reporter`:
  - Form: period + sections
  - Preview: doc-style render with headings, KPI cards, tables
  - Actions: Export PDF (browser print), Copy markdown, Email to board (uses email adapter — Phase 3)

## 9. Failure / edge cases
- No data in period → produce a report stating that and pointing to data-health gaps
- Section tool errors → continue with other sections, mark missing in report

## 10. Acceptance criteria
- [ ] Card on ED dashboard
- [ ] Generates a 6-section report in < 60s on demo data
- [ ] Saved to `board_reports` with status `draft`
- [ ] Export PDF works (print stylesheet)
- [ ] Activity logged

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-2-named-agents/03-board-reporter-agent.md
Follow base + agent template specs. Reuse existing BoardReportPreview component. Use AI SDK tool calling for the data-fetch tools listed; stopWhen stepCountIs(50). Run gstack.
```
