# Payment Ingest Adapter

## 1. Goal
Ingest donations from Stripe, Donorbox, Givebutter, or a CSV upload into `nonprofit_donations`.

## 2. User story
As a **finance manager**, I want **donations from our payment processor to flow into the control tower automatically**, so that **board reports match the bank**.

## 3. KPI moved
- Time from gift received to visible in dashboard: **days → minutes**

## 4. Scope (IN)
- Edge function `payment-ingest` accepts webhook events from each provider
- CSV upload page for manual ingest (always available)
- Idempotency: `external_id` unique constraint per provider

## 5. Out of scope (OUT)
- Refunds, disputes (Phase 4)
- Recurring subscription management

## 6. Files
```
supabase/functions/payment-ingest/index.ts      (router)
supabase/functions/_shared/payments/
├── types.ts
├── stripe.adapter.ts
├── donorbox.adapter.ts
├── givebutter.adapter.ts
└── csv.adapter.ts

src/pages/admin/PaymentImport.tsx               (CSV uploader)
src/services/payments.service.ts                (client wrapper)
```

## 7. Data model
```sql
ALTER TABLE public.nonprofit_donations
  ADD COLUMN IF NOT EXISTS external_provider TEXT,
  ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS nonprofit_donations_external_uniq
  ON public.nonprofit_donations(external_provider, external_id)
  WHERE external_provider IS NOT NULL;
```

## 8. API surface
**POST** `/payment-ingest/:provider`
- Auth: webhook signature (HMAC) — no JWT
- Request: provider-native payload
- Response: `{ ok: true, imported: 1, skipped_duplicate: 0 }`
- Errors: 401 invalid signature, 422 unprocessable

CSV path: client uploads → service parses → batch insert via service-role function with idempotency.

## 9. UI spec
- Admin → Integrations → Payments card per provider with webhook URL + secret + Test button
- Admin → Import → CSV uploader with column mapping (date, amount, donor name, email, external_id)

## 10. Acceptance criteria
- [ ] Stripe webhook with valid signature inserts a donation
- [ ] Duplicate webhook is a no-op (idempotent)
- [ ] CSV upload of 1000 rows < 10s with progress
- [ ] Invalid signature → 401
- [ ] Activity logged

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-3-portability/03-payment-ingest-adapter.md
Implement the router + adapters. Webhook routes MUST validate provider signatures. CSV import via batch insert.
Run gstack.
```
