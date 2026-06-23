# Form 990 / Audit Pack

## 1. Goal
Generate an IRS Form 990-friendly export (PDF + CSV) summarizing donations, grants, program expenses, and reconciliation for a fiscal year.

## 2. User story
As a **finance manager**, I want **one click to produce a Form 990 prep pack**, so that **our auditor's hours go down**.

## 3. KPI moved
- Auditor hours per year: **-30%**

## 4. Scope (IN)
- `/admin/compliance/990` page with fiscal-year picker
- Edge function `generate-990-pack` returns a structured JSON + per-section CSVs
- Frontend renders PDF via browser print stylesheet
- Save snapshot to `compliance_packs` for re-download

## 5. Out of scope (OUT)
- Auto-filing with the IRS
- State-specific filings

## 6. Files
```
supabase/functions/generate-990-pack/index.ts
src/pages/admin/Compliance990.tsx
src/components/compliance/Form990Preview.tsx
src/services/compliance.service.ts
supabase/migrations/<ts>_compliance_packs.sql
```

## 7. Data
```sql
CREATE TABLE public.compliance_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,             -- 'form_990' | ...
  fiscal_year INT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_packs TO authenticated;
GRANT ALL ON public.compliance_packs TO service_role;
ALTER TABLE public.compliance_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own packs" ON public.compliance_packs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## 8. API surface
**POST** `/generate-990-pack`
- Auth: JWT
- Request: `{ fiscal_year: number }`
- Response: structured payload per Form 990 Parts I–IX

## 9. UI spec
- Fiscal-year picker
- Section preview (Parts I–IX) with totals
- Buttons: "Download CSVs" (zip), "Print PDF"
- History of past packs

## 10. Acceptance criteria
- [ ] Generates totals matching demo data
- [ ] CSV per section downloads
- [ ] PDF print layout is readable
- [ ] Saved to `compliance_packs`
- [ ] Activity logged

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-4-marketplace-compliance/02-form-990-audit-pack.md
Reuse existing generate-compliance-summary edge fn as starting point. Follow base + module specs.
Run gstack.
```
