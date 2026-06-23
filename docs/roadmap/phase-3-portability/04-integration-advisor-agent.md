# Integration Advisor Agent

## 1. Agent identity
- **Name**: Integration Advisor
- **One-liner**: A 3-question wizard that recommends the CRM, email, and payment stack that fits this nonprofit.
- **KPI moved**: % of new orgs with full stack configured in 24h
- **Owning role**: Admin (during onboarding)

## 2. Inputs (3 questions)
1. Annual budget (under $500k / $500k–$5M / $5M+)
2. Current CRM (NPSP / Bloomerang / LGL / HubSpot / Spreadsheet / None)
3. Current payment processor (Stripe / Donorbox / Givebutter / Square / None)

## 3. Output
```ts
{
  recommendations: {
    crm: { provider: string, why: string, setup_url: string },
    email: { provider: string, why: string },
    payments: { provider: string, why: string }
  },
  auto_configured: string[]   // anything we could one-click set up
}
```

## 4. System prompt
```
You are the Integration Advisor for small/mid US nonprofits. Given budget, current CRM, and current payments, recommend the lowest-friction stack. If they already have a tool, recommend that one unless it doesn't fit budget. Default to free or freemium for orgs under $500k.
```

## 5. Tools
- `setActiveIntegration(category, provider)` — needsApproval: true (UI confirms before writing)

## 6. Files
```
supabase/functions/integration-advisor/index.ts
src/components/agents/IntegrationAdvisorWizard.tsx
src/pages/admin/Integrations.tsx   (host the wizard at top)
```

## 7. Data
- Reads/writes `organization_integrations` via the tool
- Logs `ai_agent_runs`

## 8. UI contract
- 3 short questions → spinner → result card with 3 recommendations
- Each recommendation has "Use this" button (triggers `setActiveIntegration` tool with approval)

## 9. Acceptance criteria
- [ ] Wizard runs end-to-end in < 10s
- [ ] User can accept/decline each recommendation
- [ ] Accepted recommendations write `organization_integrations` rows
- [ ] Activity logged

## 10. Cursor handoff prompt
```
TASK: docs/roadmap/phase-3-portability/04-integration-advisor-agent.md
Use AI SDK tool calling with `needsApproval` for the setActiveIntegration tool. Follow agent template.
Run gstack.
```
