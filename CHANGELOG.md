# Changelog

All notable changes to Nonprofit Control Tower are documented here.

---

## [0.1.0] — 2026-05-24

### Added — 7 new pages (Market Demand = High)

All pages use demo data from `nonprofitDemoData.ts` — no Supabase queries. Routes are additive; zero existing pages modified.

**Membership Management** (`/membership`)
- Member directory with search and tier filter (General / Professional / Board / Honorary)
- Status badges: Active, Expiring, Lapsed, Pending
- Renewals tab with Send Reminder and Re-Engage actions
- Add Member form (React Hook Form + Zod)
- Member detail Sheet with contact info, interests, action buttons

**Volunteer Management** (`/volunteers`)
- Card grid with skills badges, availability, and donor crossover indicator
- Economic value reporting ($31.80/hr × total hours)
- Shift history table across all volunteers
- Add Volunteer form with skills and availability checkboxes
- Volunteer detail Sheet with hours gauge and donor crossover callout

**Full Event Management** (`/event-management`)
- Separate from `/events` (post-event intelligence page — untouched)
- Status filters: All / Upcoming / Active / Past
- Capacity progress bars (green → amber → red at 90%)
- Event detail Sheet: speakers, agenda, ticket types with revenue
- Registrations Sheet with check-in status
- Create Event dialog

**Donation Center** (`/donations`)
- Campaign cards with goal progress bars
- Donation history with frequency filter (One-Time / Monthly / Quarterly / Annual)
- Fund breakdown visualization with plain-div progress bars
- Record Donation form (RHF + Zod)

**Public Presence** (`/public-presence`)
- 6-item visibility control Switches with instant feedback
- Mock previews: Event Feed, Donation Widget, Impact Stats
- Embed code snippets with async clipboard copy (`navigator.clipboard.writeText().then().catch()`)
- Social sharing: Facebook, Twitter/X, LinkedIn, Instagram

**Impact Dashboard** (`/impact-dashboard`)
- 6 KPI cards (Beneficiaries, Volunteer Hours, Funds Raised, Programs, Events, New Donors)
- 6 expandable program outcome cards with beneficiary progress bars
- 8 milestone items with category badges
- AI-drafted annual report via `ai-chat-assistant` edge function with graceful plain-text fallback

**AI Engagement Scoring** (`/engagement-scoring`)
- 12 demo members scored 0–100 (Active ≥70 / At Risk 40–69 / Lapsed <40)
- At-risk banner with bulk Re-Engage All action
- Tabbed table filtered by tier with score bar column
- Member detail Sheet: score gauge, engagement signals breakdown, AI Next Best Action via `ai-chat-assistant`

### Changed

- `package.json` — version bumped `0.0.0` → `0.1.0` (minor: 7 new feature modules)
- `src/modules/platform/routes.tsx` — 7 routes appended; dead `Help` import removed
- `src/shared/data/navigationStructure.ts` — 7 nav items appended to `nonprofit-ops` group
- `src/shared/data/nonprofitDemoData.ts` — 5 new data sections appended (Membership, Volunteers, Events, Donations, Public Presence)

### Fixed (code review findings applied before merge)

- `PublicPresencePage` — `navigator.clipboard.writeText()` now async with `.catch()` error toast
- `PublicPresencePage` — `window.open()` hardened with `noopener,noreferrer` (×2)
- `EventManagementPage` — Array-index React keys replaced with stable string keys (`speaker.name`, `item.time`)
- `EventManagementPage` — Emoji `💰` replaced with `DollarSign` lucide icon
- `DonationCenterPage` — `form.watch()` destructured once to prevent excessive re-renders
- `MembershipPage` — `form.watch()` destructured once to prevent excessive re-renders
- `routes.tsx` — Dead `import Help from "@/pages/Help"` removed

---

## [0.0.0] — Pre-release

Initial build: Dashboard, Grants, Events, Board Reports, Data Health, Reconciliation, Donor Pipeline, Donor Retention, Programs, Communications, Grant Writer, AI Agent Browse, Knowledge Base, Admin Panel, Supabase Auth (email + Google + Microsoft SSO).
