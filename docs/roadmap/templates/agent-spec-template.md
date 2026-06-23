# Named Agent Spec Template

> Every named agent owns one workflow and one KPI. Generic "ask the AI" chat does not count.

## 1. Agent identity
- **Name**: [e.g. Donor Retention Agent]
- **One-liner**: what it does in 10 words
- **KPI moved**: the number on the dashboard card
- **Owning role**: ED / DD / FM / OM

## 2. Inputs
| Field | Type | Source |
|---|---|---|
| ... | ... | DB table / user input |

## 3. Outputs
| Field | Type | Where it surfaces |
|---|---|---|
| `summary` | string (markdown) | Agent card "last run" |
| `actions` | array | Action drawer |
| `kpi_delta` | number | Card metric |

## 4. System prompt (server-side, never in client)
```
You are the <name> agent for a nonprofit using <project-name>.
Your job: <one paragraph>.
Constraints: <PII handling, tone, length>.
Return JSON matching the schema below.
```

## 5. Tools (if multi-step)
List tool names, input schemas (Zod), and side effects. Use `stepCountIs(50)` minimum.

## 6. Files
```
supabase/functions/<agent-name>/index.ts
src/services/agents.service.ts                 (add runAgent('<name>'))
src/components/agents/<AgentName>Card.tsx
src/pages/agents/<AgentName>Detail.tsx
supabase/migrations/<ts>_<agent>_run_log.sql   (if new run-log table)
```

## 7. Data
- Reads from: list tables
- Writes to: `ai_agent_runs` (existing), plus any agent-specific log table
- Logs: `logActivity('agent_run', { agent: '<name>', kpi_delta })`

## 8. UI contract
- **Dashboard card**: title, last-run timestamp, KPI value, "Run now" button, "View details" link
- **Detail page**: input form (if any), run history table, latest output rendered as markdown
- **States**: never-run / running / success / error — each with copy

## 9. Failure handling
- Edge fn returns 4xx/5xx → toast with retry
- 429 → "Rate limited, try again in 1 min"
- 402 → "Out of AI credits — see Settings → Plans"
- Tool failure → log to `ai_agent_runs.error`, mark run as failed, surface to user

## 10. Acceptance criteria
- [ ] Card renders on role dashboard
- [ ] "Run now" triggers edge fn, shows progress, displays result
- [ ] Run is logged in `ai_agent_runs`
- [ ] KPI delta is real (not faked)
- [ ] Error states tested

## 11. Cursor handoff prompt
```
Implement the <agent-name> named agent for the Nonprofit Control Tower.

Stack: React 18 + Vite + TypeScript + shadcn/ui on Supabase (RLS) with Deno Edge Functions. AI via Lovable AI Gateway (`npm:ai` + `@ai-sdk/openai-compatible`, model `google/gemini-3-flash-preview`, header `Lovable-API-Key: $LOVABLE_API_KEY`, baseURL `https://ai.gateway.lovable.dev/v1`).

Follow the spec in docs/roadmap/phase-2-named-agents/<file>.md exactly. Read docs/roadmap/01-architecture-baseline.md first. Use the service-layer pattern. Log every run to ai_agent_runs.

Run gstack: /plan-eng-review → build → /review → /ship → /document-release.
```
