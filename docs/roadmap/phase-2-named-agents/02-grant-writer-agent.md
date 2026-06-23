# Grant Writer Agent

## 1. Agent identity
- **Name**: Grant Writer Agent
- **One-liner**: Drafts a tailored grant proposal section from the org's program data + the funder's RFP.
- **KPI moved**: Grant drafts shipped per month
- **Owning role**: Executive Director / Development Director

## 2. Inputs
| Field | Type | Source |
|---|---|---|
| program_id | uuid | `nonprofit_programs` |
| funder_rfp_text | string (markdown or pasted) | user upload |
| section | enum: `need`, `approach`, `outcomes`, `budget_narrative`, `org_capacity` | UI |
| word_limit | int | UI |

## 3. Outputs
```ts
{
  draft_markdown: string,
  word_count: number,
  citations: Array<{ source: 'program' | 'rfp' | 'kb', snippet: string }>,
  open_questions: string[]
}
```

## 4. System prompt
```
You are a senior grant writer for a small/mid US nonprofit.
Write the requested section of a proposal in plain, donor-friendly language.
Ground every factual claim in the provided program data or org KB. If a fact is missing, add it to open_questions instead of inventing.
Match the funder's tone and language from the RFP. Stay within word_limit.
Return JSON matching the schema.
```

## 5. Tools
Optional: KB retrieval tool that queries the existing `semantic-search` / `unified-knowledge-search` edge function for org background. Use `stepCountIs(50)`.

## 6. Files
```
supabase/functions/grant-writer-agent/index.ts    (use existing generate-grant-draft as starting point)
src/services/agents.service.ts                    (add runGrantWriter())
src/components/agents/GrantWriterCard.tsx
src/pages/agents/GrantWriterDetail.tsx
src/components/agents/GrantDraftEditor.tsx
```

## 7. Data
- Reads: `nonprofit_programs`, KB via existing semantic-search
- Writes: `ai_agent_runs`, `grant_drafts` (new table)

```sql
CREATE TABLE public.grant_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program_id UUID,
  funder_name TEXT,
  section TEXT NOT NULL,
  draft_markdown TEXT NOT NULL,
  word_count INT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | shipped
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grant_drafts TO authenticated;
GRANT ALL ON public.grant_drafts TO service_role;
ALTER TABLE public.grant_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own drafts" ON public.grant_drafts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## 8. UI contract
- **Card**: drafts shipped this month + "New draft" button
- **Detail page** `/agents/grant-writer`:
  - Left: form (program select, paste RFP, section dropdown, word limit slider)
  - Right: streaming markdown editor with citations panel + open-questions list
  - "Mark shipped" updates status

## 9. Failure / edge cases
- RFP > 50k chars → truncate with notice
- Model returns less than 50% of word_limit → flag in UI, offer regenerate

## 10. Acceptance criteria
- [ ] Card on ED + DD dashboards
- [ ] Drafts persist to `grant_drafts`
- [ ] Citations panel shows snippets used
- [ ] Open questions surfaced inline
- [ ] Activity logged

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-2-named-agents/02-grant-writer-agent.md
Follow docs/roadmap/01-architecture-baseline.md and templates/agent-spec-template.md.
Use Lovable AI Gateway + AI SDK Output.object for structured output.
Run gstack flow.
```
