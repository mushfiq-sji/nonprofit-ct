# Onboarding Wizard

## 1. Goal
A 5-step wizard the first time a real user signs in (skipping demo personas) that takes the org from zero to "first agent run" in under 10 minutes.

## 2. User story
As a **new ED**, I want **a guided setup**, so that **I do not bounce on a confusing empty dashboard**.

## 3. KPI moved
- 30-day activation: **+25pp**

## 4. Scope (IN)
5 steps:
1. **Org basics** — name, logo, fiscal year start
2. **Import donors** — upload CSV OR connect CRM via Integration Advisor (Phase 3 · 04)
3. **Connect email** — paste API key OR skip (default SendGrid)
4. **Pick 3 agents** — checkboxes for the 6 named agents (3 are pre-checked: Donor Retention, Board Reporter, Data Health)
5. **Invite board / staff** — email invites with role assignment

Progress saved to `app_config.onboarding_state` so a refresh resumes mid-wizard. Final step writes `app_config.onboarding_complete = true`.

## 5. Out of scope (OUT)
- Multi-org tenancy
- Onboarding analytics dashboard (track via activity_logs for now)

## 6. Files
```
src/pages/onboarding/Wizard.tsx
src/components/onboarding/Step1OrgBasics.tsx
src/components/onboarding/Step2ImportDonors.tsx
src/components/onboarding/Step3ConnectEmail.tsx
src/components/onboarding/Step4PickAgents.tsx
src/components/onboarding/Step5InviteTeam.tsx
src/services/onboarding.service.ts
src/components/auth/OnboardingGate.tsx     (redirects to wizard until complete)
```

## 7. Data
```sql
INSERT INTO public.app_config (key, value) VALUES
  ('onboarding_complete', 'false'::jsonb),
  ('onboarding_state', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

## 8. API surface
None new — wizard uses existing services (donors, email, agents, users).

## 9. UI spec
- Progress bar 1/5 → 5/5
- Each step has Skip + Next; final has Finish
- "Resume later" closes wizard without losing state
- After Finish: confetti toast + redirect to ED dashboard

## 10. Acceptance criteria
- [ ] Wizard appears only when `onboarding_complete = false`
- [ ] Demo personas bypass it (already complete)
- [ ] State persists across refresh
- [ ] Activity logged per step
- [ ] Email invites land

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-4-marketplace-compliance/06-onboarding-wizard.md
Use react-hook-form + zod per step. Step 2 reuses CSV adapter (Phase 3 · 01); Step 3 reuses email adapter (Phase 3 · 02). Run gstack.
```
