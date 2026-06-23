# Secrets Self-Service Page

## 1. Goal
Admin UI to paste API keys for each adapter, with a "Test connection" button per provider. Keys are stored as Supabase edge-function secrets, never in the database, never echoed back to the client.

## 2. User story
As an **admin**, I want **a UI to paste my Bloomerang API key**, so that **I do not need to ask engineering or open Supabase dashboard**.

## 3. KPI moved
- Self-serve integration setup rate: **0% → 90%**

## 4. Scope (IN)
- `/admin/integrations` page lists every adapter (CRM, email, payments) with status (configured / not configured / failing)
- "Edit" opens a drawer with required fields
- "Save" calls an edge fn that uses the Supabase Management API (or the project's secret-management tool) to write secrets
- "Test" runs a non-mutating call against the provider and reports success/failure

## 5. Out of scope (OUT)
- Reading existing secret values (write-only UI)
- Rotation reminders

## 6. Files
```
supabase/functions/integration-secret-set/index.ts   (admin-only)
supabase/functions/integration-test/index.ts         (admin-only; runs adapter testConnection())
src/pages/admin/Integrations.tsx
src/components/integrations/IntegrationCard.tsx
src/components/integrations/SecretsDrawer.tsx
src/services/integrations.service.ts
```

## 7. Data
- Writes `organization_integrations.last_tested_at`, `last_test_status`, `is_active`
- Secrets never touch the DB

## 8. API surface
**POST** `/integration-secret-set`
- Auth: admin JWT
- Request: `{ provider: string, secret_name: string, secret_value: string }`
- Response: `{ ok: true }`
- Errors: 401, 403, 502 (Management API failure)

**POST** `/integration-test`
- Auth: admin JWT
- Request: `{ provider: string }`
- Response: `{ ok: true|false, message: string }`

## 9. UI spec
- Grid of cards, one per adapter
- Status pill: green (active), amber (configured, not tested), grey (not configured), red (last test failed)
- Test button shows spinner then toast

## 10. Acceptance criteria
- [ ] Only admins can open the page
- [ ] Secret values never appear in network response after save
- [ ] Test button updates `last_tested_at` + `last_test_status`
- [ ] Activity logged for set/test

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-3-portability/05-secrets-self-service-page.md
Server-side admin check via has_role on every request. Never return secret values. Use the project's secret-management mechanism for writes.
Run gstack.
```
