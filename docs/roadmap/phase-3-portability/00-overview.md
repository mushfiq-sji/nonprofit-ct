# Phase 3 — Portability & Integrations

**Goal**: a customer can plug their own CRM, email provider, and payment processor without forking the codebase. Same code runs on Lovable Cloud or their own Supabase.

## Why
Most nonprofits already have a CRM. We must accept it, not replace it. Same for email and payments.

## Modules

| # | Module | Outcome |
|---|---|---|
| 01 | CRM adapter interface | One interface, swappable for NPSP / Bloomerang / LGL / HubSpot / CSV |
| 02 | Email adapter | SendGrid / Resend / Mailgun behind one `send-email` fn |
| 03 | Payment ingest adapter | Stripe / Donorbox / Givebutter / CSV → `nonprofit_donations` |
| 04 | Integration Advisor agent | 3-question wizard recommends a stack |
| 05 | Secrets self-service page | Admin pastes keys + "Test connection" |
| 06 | Self-host guide | `docs/SELF_HOST.md` — clone, 5 env vars, done |

## Sequencing
- 01 and 02 first (gate everything else)
- 03, 05 in parallel after 01
- 04 last (depends on 01–03 being live)
- 06 can be written anytime; finalize after 01–05 are real
