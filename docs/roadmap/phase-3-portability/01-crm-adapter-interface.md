# CRM Adapter Interface

## 1. Goal
Define one TypeScript interface that every CRM provider implements, so the app reads/writes donors, donations, and pledges through a single contract.

## 2. User story
As a **DD using Bloomerang**, I want **the app to read my Bloomerang donors directly**, so that **I do not double-enter data**.

## 3. KPI moved
- % of customers with live CRM sync within 1 week of signup: **0% → 60%**

## 4. Scope (IN)
- `src/services/crm/types.ts` — interface + DTOs
- Adapter stubs: `salesforce-npsp.adapter.ts`, `bloomerang.adapter.ts`, `little-green-light.adapter.ts`, `hubspot.adapter.ts`, `csv.adapter.ts`
- Factory: `getCrmAdapter()` reads `organization_integrations` row
- Stub adapters return demo data when not configured (so the app keeps working)

## 5. Out of scope (OUT)
- Full bidirectional sync for every provider (start with read-only)
- Background sync jobs (Phase 4)

## 6. Files to create / change
```
src/services/crm/
├── types.ts                   (new — Donor, Donation, Pledge DTOs + CrmAdapter interface)
├── _factory.ts                (new — getCrmAdapter())
├── salesforce-npsp.adapter.ts (new — stub)
├── bloomerang.adapter.ts      (new — stub)
├── little-green-light.adapter.ts (new — stub)
├── hubspot.adapter.ts         (new — stub)
└── csv.adapter.ts             (new — file upload → memory map)

src/services/donors.service.ts (refactor to delegate to crm adapter)
src/services/donations.service.ts (refactor to delegate to crm adapter)

supabase/migrations/<ts>_organization_integrations.sql (if not present)
```

## 7. Data model
```sql
CREATE TABLE IF NOT EXISTS public.organization_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                 -- the admin who configured it
  category TEXT NOT NULL,                -- 'crm' | 'email' | 'payments'
  provider TEXT NOT NULL,                -- 'salesforce_npsp' | 'bloomerang' | ...
  config JSONB NOT NULL DEFAULT '{}'::jsonb,   -- non-secret config
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_tested_at TIMESTAMPTZ,
  last_test_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category, provider)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_integrations TO authenticated;
GRANT ALL ON public.organization_integrations TO service_role;
ALTER TABLE public.organization_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage org integrations"
  ON public.organization_integrations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

## 8. Interface (TypeScript)
```ts
export interface CrmAdapter {
  readonly provider: string;
  listDonors(opts?: { since?: string; limit?: number }): Promise<Donor[]>;
  getDonor(id: string): Promise<Donor | null>;
  listDonations(opts?: { donorId?: string; since?: string }): Promise<Donation[]>;
  testConnection(): Promise<{ ok: boolean; message?: string }>;
}
```

Secrets live as edge-function secrets (Bloomerang API key, NPSP OAuth tokens). The adapter calls a small edge fn `crm-proxy` that holds the secret — the client never sees keys.

## 9. UI spec
- New "Integrations → CRM" page (built in module 05)
- Each adapter has a config card with required fields + Test button

## 10. Acceptance criteria
- [ ] Interface compiles, all 5 stubs implement it
- [ ] `donors.service.ts` uses adapter, falls back to demo data when none active
- [ ] `csv.adapter.ts` can import a real CSV in browser memory
- [ ] Unit-style smoke test: switching adapter changes data source without UI changes
- [ ] Activity logged on connect/test

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-3-portability/01-crm-adapter-interface.md

Read docs/roadmap/01-architecture-baseline.md and docs/roadmap/phase-1-foundation/01-service-layer-refactor.md.

Define the CrmAdapter interface + DTOs in src/services/crm/types.ts. Implement 5 adapter stubs (csv first — fully working — others return mocked or "not configured"). Refactor donors.service.ts and donations.service.ts to delegate to the active adapter via _factory.ts.

Add organization_integrations table per spec. Run gstack.
```
