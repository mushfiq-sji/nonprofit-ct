# Donor PII Guardrails

## 1. Goal
By default, redact donor PII (name, email, phone, address) from any prompt sent to an external AI provider. Admins can opt in to pass PII when needed.

## 2. User story
As a **privacy-conscious ED**, I want **AI features to work without leaking donor names to the model**, so that **we honor our donor privacy promise**.

## 3. KPI moved
- PII leakage incidents: **0**
- Customer privacy objections in sales: **-50%**

## 4. Scope (IN)
- `src/lib/pii.ts` — `redactPII(text, schema)` and `redactDonor(donor)` helpers
- Edge function `_shared/pii.ts` mirror for server-side use
- Every named agent passes records through the redactor before composing the prompt
- Admin → Settings → Privacy → "Allow PII in AI prompts" toggle (default off)
- All AI runs log a `pii_redacted` boolean

## 5. Out of scope (OUT)
- DLP for outbound emails
- DLP for KB ingestion

## 6. Files
```
src/lib/pii.ts
supabase/functions/_shared/pii.ts
supabase/functions/<every-agent>/index.ts     (call redactor before prompt build)
src/pages/admin/Privacy.tsx
src/services/settings.service.ts              (allowPiiInAi flag)
```

## 7. Data
```sql
INSERT INTO public.app_config (key, value)
VALUES ('allow_pii_in_ai', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.ai_agent_runs
  ADD COLUMN IF NOT EXISTS pii_redacted BOOLEAN NOT NULL DEFAULT true;
```

## 8. Redactor contract
```ts
type RedactionSchema = { name?: 'hash' | 'mask' | 'keep', email?: ..., phone?: ..., address?: ... };
redactPII(input: object | string, schema?: RedactionSchema): { redacted: T, map: Record<string, string> }
```
- Default schema: name→`Donor #1234`, email→`d1234@example.invalid`, phone→`+1xxx`, address→omit
- `map` lets the agent rehydrate names client-side when displaying back to the user

## 9. UI spec
- Privacy page: toggle + explainer + link to docs
- Agent detail pages: small lock icon "PII redacted before AI call"

## 10. Acceptance criteria
- [ ] With flag off (default), donor name never appears in `ai_agent_runs.input`
- [ ] With flag on, raw donor data is passed
- [ ] All 6 named agents use the redactor
- [ ] Activity logged when admin toggles the flag

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-4-marketplace-compliance/03-donor-pii-guardrails.md
Implement redactor (client + server). Update each named agent to call it. Add admin toggle.
Run gstack.
```
