# Phase 4 — Marketplace, Compliance & Polish

**Goal**: turn the app into a platform — modules can be installed, compliance reports generate themselves, and onboarding is a guided wizard.

## Modules

| # | Module | Outcome |
|---|---|---|
| 01 | Module marketplace v1 | Install/uninstall modules against `app_modules` |
| 02 | Form 990 / audit pack | Auto-generated IRS-friendly export |
| 03 | Donor PII guardrails | Redact PII from AI prompts by default |
| 04 | Public board-share link | Read-only signed URL for a board pack |
| 05 | Pricing & billing | Stripe-powered plans page |
| 06 | Onboarding wizard | 5-step flow on first login |

## Sequencing
- 03 first (security baseline)
- 06 second (improves activation immediately)
- 01, 02, 04, 05 in parallel after that
