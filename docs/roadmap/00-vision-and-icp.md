# Vision & ICP

## Product
**Nonprofit Control Tower** — an operational intelligence layer that sits on top of a nonprofit's existing CRM. Not a CRM replacement. Surfaces donor, grant, event, volunteer, and finance signals into role-specific dashboards driven by named AI agents.

## ICP
- **Org size**: 5–50 employees
- **Annual budget**: $500k – $20M
- **Buyer**: Executive Director or Development Director
- **Existing CRM**: Salesforce NPSP, Bloomerang, Little Green Light, HubSpot, or spreadsheets
- **Pain**: data lives in 6 tools, board reporting takes a week, donor lapses go unnoticed, grant deadlines are tracked in a notion doc

## Promise
> Clone in Lovable → sign in → see your org's demo data → swap in your CRM in 3 clicks → ship a board-ready dashboard on Monday. Time to value < 30 minutes.

## Deployment scenarios
1. **Lovable Cloud (default)** — fork → boot → done. Backend = Lovable-managed Supabase.
2. **Customer-hosted Supabase** — same code, customer's Supabase URL/keys in `.env`, migrations applied via bundled SQL.
3. **On-prem Supabase** — same as #2 with self-hosted Postgres. The app must not assume any Lovable-only feature.

## Four roles
- **Executive Director (ED)** — board readiness, KPIs, grants, data health
- **Development Director (DD)** — donor engagement, events, pipeline
- **Finance Manager (FM)** — reconciliation, fund accounting, grant spending
- **Operations Manager (OM)** — data hygiene, integrations, AI agent runs

## Success metrics
- Time-to-first-value (remix click → first agent run): **< 30 min**
- 30-day activation: **70% complete onboarding wizard**
- Each named agent reports a measurable $ or % lift per org per month
- Self-host adoption: tracked via `app_config.deployment_mode` (cloud | self_host)

## Glossary
- **Named agent** — a workflow-owning AI feature with a fixed input, output, and KPI (not a generic chatbot)
- **Module** — a feature area (Donations, Grants, Events, etc.) gated by `app_modules` table
- **Service** — a `src/services/<domain>.service.ts` file that owns all data access for one domain
- **Adapter** — a provider-swappable implementation behind a stable interface (CRM, email, payments)
