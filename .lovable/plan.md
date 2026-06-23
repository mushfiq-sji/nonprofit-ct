
# Plan: Self-contained roadmap docs under `/docs/roadmap/`

Goal: produce a folder of Cursor-ready specs. Each file must stand alone — no reference to "ePhysician" or "SJ-CT". Any agent (gstack/Cursor/Claude Code) can pick up one file and ship it without seeing the other projects or this conversation.

## Folder structure to create

```
docs/roadmap/
├── README.md                              # index + how to use with gstack/Cursor
├── 00-vision-and-icp.md                   # product vision, ICP, success metrics, glossary
├── 01-architecture-baseline.md            # current stack, conventions, file layout, naming
│
├── phase-1-foundation/
│   ├── 00-overview.md
│   ├── 01-service-layer-refactor.md       # src/services/*.service.ts pattern
│   ├── 02-provider-agnostic-supabase.md   # env-driven client + bootstrap
│   ├── 03-seed-on-boot.md                 # auto-seed demo data + 4 role users
│   ├── 04-migration-bundle-export.md      # scripts/export-migrations.sh
│   ├── 05-sidebar-cleanup.md              # hide legacy modules behind flag
│   ├── 06-demo-persona-switcher.md        # 1-click ED/DD/FM/OM login
│   └── 07-reset-demo-button.md            # admin wipe + reseed
│
├── phase-2-named-agents/
│   ├── 00-overview.md                     # agent contract template
│   ├── 01-donor-retention-agent.md
│   ├── 02-grant-writer-agent.md
│   ├── 03-board-reporter-agent.md
│   ├── 04-event-roi-agent.md
│   ├── 05-volunteer-scheduler-agent.md
│   └── 06-data-health-agent.md
│
├── phase-3-portability/
│   ├── 00-overview.md
│   ├── 01-crm-adapter-interface.md        # NPSP / Bloomerang / LGL / HubSpot / CSV
│   ├── 02-email-adapter.md                # SendGrid / Resend / Mailgun
│   ├── 03-payment-ingest-adapter.md       # Stripe / Donorbox / Givebutter / CSV
│   ├── 04-integration-advisor-agent.md    # 3-question wizard
│   ├── 05-secrets-self-service-page.md
│   └── 06-self-host-guide.md              # docs/SELF_HOST.md content spec
│
├── phase-4-marketplace-compliance/
│   ├── 00-overview.md
│   ├── 01-module-marketplace-v1.md
│   ├── 02-form-990-audit-pack.md
│   ├── 03-donor-pii-guardrails.md
│   ├── 04-public-board-share-link.md
│   ├── 05-pricing-and-billing.md
│   └── 06-onboarding-wizard.md
│
└── templates/
    ├── module-spec-template.md            # the shape every spec follows
    ├── agent-spec-template.md             # agent input/output/KPI contract
    └── handoff-prompt-template.md         # paste-into-Cursor prompt
```

## Spec template each module file follows (so Cursor/gstack can execute)

Every module file uses this exact 10-section structure:

1. **Goal** — one sentence outcome
2. **User story** — "As a {role}, I want {outcome} so that {value}"
3. **KPI moved** — what number changes after ship
4. **Scope** — bullet list of what's IN
5. **Out of scope** — explicit OUT list
6. **Files to create / change** — exact paths under `src/`, `supabase/functions/`, `supabase/migrations/`
7. **Data model** — table SQL (CREATE / ALTER) with RLS + GRANT block matching project rules
8. **API surface** — edge function signatures (input JSON, output JSON, errors)
9. **UI spec** — page route, components, states (empty / loading / error / success), copy
10. **Acceptance criteria** — checklist a reviewer can tick off
11. **Cursor handoff prompt** — copy-paste block that includes context + the gstack flow (`/plan-eng-review` → build → `/review` → `/ship` → `/document-release`)

## Self-containment rules I will follow
- No mention of ePhysician, SJ-CT, or other projects.
- Each spec restates the relevant subset of project conventions (stack, naming, RLS+GRANT pattern, activity logging, validation) at the top so it works without other files.
- Every file references only: this project's existing tables, this project's existing edge functions, and the Lovable + Supabase + Lovable AI docs (with links).
- Templates double as a library: a new module can be added by copying `templates/module-spec-template.md`.

## What I will NOT do in this pass
- Implement any code.
- Touch database schema.
- Add screenshots/diagrams (text-first; can add later).

## Deliverable
~30 markdown files under `docs/roadmap/`, each runnable independently in Cursor + gstack.

## Approve to proceed
Say "go" and I will create the full tree in one batch. If you want to trim phases (e.g. skip Phase 4) or reorder, tell me before I start.
