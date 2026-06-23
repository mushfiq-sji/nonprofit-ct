# Pricing & Billing

## 1. Goal
Stripe-powered pricing page and self-service plan management.

## 2. User story
As an **ED**, I want **to upgrade my plan in app**, so that **I do not need a sales call**.

## 3. KPI moved
- Self-serve conversion rate
- ARPU

## 4. Scope (IN)
- `/pricing` public page (already exists — wire to Stripe)
- Stripe Checkout for plan purchase
- Stripe webhook to update `organization_subscription` row
- Admin → Billing page with current plan, invoices, "Manage in Stripe portal"

## 5. Out of scope (OUT)
- Usage-based billing
- Multi-currency

## 6. Files
```
supabase/functions/stripe-create-checkout/index.ts
supabase/functions/stripe-webhook/index.ts
supabase/functions/stripe-portal/index.ts
src/pages/Pricing.tsx                   (wire CTAs)
src/pages/admin/Billing.tsx
src/services/billing.service.ts
supabase/migrations/<ts>_subscriptions.sql
```

## 7. Data
```sql
CREATE TABLE public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,              -- admin who owns billing
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.organization_subscriptions TO authenticated;
GRANT ALL ON public.organization_subscriptions TO service_role;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads subscription" ON public.organization_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages subscription" ON public.organization_subscriptions
  FOR ALL USING (false) WITH CHECK (false);   -- only service_role bypasses
```

## 8. API surface
**POST** `/stripe-create-checkout` — `{ plan }` → `{ checkout_url }`
**POST** `/stripe-webhook` — signature-validated; updates subscription
**POST** `/stripe-portal` — `{}` → `{ portal_url }`

## 9. UI spec
- Pricing page: 3 tiers (Free / Pro / Org) with feature matrix
- Billing page: current plan, next renewal, "Upgrade" + "Manage" buttons

## 10. Acceptance criteria
- [ ] Checkout completes; webhook updates plan
- [ ] Plan downgrades on cancellation
- [ ] Webhook signature validated
- [ ] Activity logged

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-4-marketplace-compliance/05-pricing-and-billing.md
Stripe secrets added via secrets tool when user provides them. Webhook MUST validate signature using Stripe's library.
Run gstack.
```
