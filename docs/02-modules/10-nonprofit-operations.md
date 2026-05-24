# Nonprofit Operations Modules

The Nonprofit Control Tower includes six operational modules designed specifically for nonprofit organizations, plus an AI-powered donor engagement feature. These modules surface insights from connected CRM and finance systems — they are **not data entry tools**.

---

## Modules

### Donor Pipeline (`/donor-pipeline`)

Visual Kanban board for tracking donor upgrade opportunities through five cultivation stages.

**Features:**
- 5-stage pipeline: Identified → Outreach Scheduled → In Conversation → Pledge Made → Upgraded
- Donor profile drawer with full context (giving history, fund designations, contact notes, volunteer history)
- Drag-and-drop between stages
- Action modals for scheduling outreach, logging contact, and recording pledges
- Engagement scoring with consistency and upgrade readiness indicators
- **AI Acknowledgment Letter Generator** — one-click personalized thank-you letters

**AI Acknowledgment Letter Generator:**
- Reads donor name, gift amount, gift date, fund designation, giving history, contact notes, and volunteer/event history
- Generates a personalized letter in the Executive Director's voice
- References specific gifts ("your generous gift of $2,500 to our Youth Programs fund")
- Includes personal touches from contact notes
- Action buttons: Copy to Clipboard · Download · Attach to Donor Record · Edit Before Sending
- Powered by Lovable AI Gateway (edge function: `generate-donor-letter`)

**Key components:** `DonorPipelinePage.tsx`

---

### Data Health (`/data-health`)

Surface CRM data quality issues from connected systems.

**Features:**
- Overall Data Health Score (e.g., 82%)
- Duplicate probability list with confidence scores and side-by-side comparison drawers
- Incomplete profile list (missing fields) with completion forms
- Stale record detection and archiving
- Household inconsistencies
- Soft credit alerts
- **Mid-Donor Upgrade Opportunities** — AI-identified donors ready for higher giving tiers based on consistency and engagement scores
- Merge suggestion preview with Approve/Review/Dismiss actions

**UI Pattern:** Insight cards with action buttons, NOT record tables.

---

### Grants Management (`/grants`)

Track grant lifecycle, deadlines, and fund utilization.

**Features:**
- Active grants list with status indicators ($497K total)
- Upcoming deadline alerts with countdown timers
- Fund utilization progress bars (spending vs. allocation)
- Spending alerts when grants approach thresholds
- Deliverable checklists with staff assignment
- Generate Compliance Summary action

**Key components:** `GrantsManagement.tsx` in the nonprofit-ops pages

---

### Events (`/events`)

Post-event engagement intelligence from connected event platforms.

**Features:**
- Recent events with attendance data
- **"Thank + Tag" Workflow**: Bulk-tag attendees in Salesforce (donor, volunteer, prospect, board candidate)
- Volunteer interest flags
- AI-suggested follow-up actions
- Automated follow-up task creation for prospects and volunteers
- Create Follow-Up Task action

---

### Board Reports (`/board-reports`)

Generate board-ready reports from aggregated data.

**Features:**
- KPI Summary cards
- Financial Snapshot with automated variance highlights (green for positive, red for negative)
- Engagement Metrics
- Document-style preview (see the report as the board will receive it)
- Approval workflow: Draft → Review → Approve
- Download PDF button
- Generate New Draft button

---

### Reconciliation (`/reconciliation`)

Match transactions across payment processors and CRM/finance systems.

**Features:**
- Unmatched transactions list (Stripe charges with no CRM record)
- **Match or Create Workflow**: Match to existing donor record or create new
- Fee variance alerts
- Restricted fund mismatches
- Monthly reconciliation summary
- Export Reconciliation Report
- Mark as Balanced action

---

---

### Membership Management (`/membership`)

Member directory, renewals management, and onboarding.

**Features:**
- Member directory with search and tier filter (General / Professional / Board / Honorary)
- Status badges: Active, Expiring (within 30 days), Lapsed, Pending
- 4 KPI cards: Total Members, Active, Expiring Soon, Lapsed
- Renewals tab: Expiring-soon list + Lapsed list with Send Reminder / Re-Engage actions (toast)
- Add Member form (React Hook Form + Zod: name, email, tier)
- Member detail Sheet: contact info, employer, interests as badges, action buttons

**Key components:** `MembershipPage.tsx`

---

### Volunteer Management (`/volunteers`)

Volunteer roster, shift tracking, and economic value reporting.

**Features:**
- 4 KPI cards: Total Volunteers, Active This Month, Total Hours, Economic Value ($31.80/hr × hours)
- Card grid with avatar initials, skills as badges, availability slots, donor crossover indicator (❤️)
- Shifts tab: flat table of all shifts sorted by date (Upcoming / Completed / Cancelled)
- Add Volunteer form (RHF + Zod: name, email, skills, availability)
- Volunteer detail Sheet: skills, availability, hours gauge, shift history, donor crossover amber callout

**Key components:** `VolunteersPage.tsx`

---

### Full Event Management (`/event-management`)

Full event lifecycle — create, manage registrations, track capacity, and record revenue.

**Important:** This is separate from `/events` (post-event intelligence). `/events` is not modified.

**Features:**
- Status filters: All / Upcoming / Active / Past
- Event cards with capacity progress bar (green → amber → red at 90%), ticket summary
- Event detail Sheet: description, speakers, agenda, ticket types with revenue
- Registrations Sheet: attendee table with check-in status
- Create Event Dialog (RHF + Zod: title, date, location, capacity, description)

**Key components:** `EventManagementPage.tsx`

---

### Donation Center (`/donations`)

Campaign management, donation tracking, and fund breakdown reporting.

**Features:**
- 4 KPI cards: Raised This Year, Average Gift, Recurring Donors, Active Campaigns
- Campaigns tab: Campaign cards with name, fund designation badge, goal progress bar (raised/goal %)
- Donations tab: Frequency filter pills (All / One-Time / Monthly / Quarterly / Annual) + Table
- Fund Breakdown tab: Horizontal progress bars per fund with amounts and percentages
- New Donation tab: RHF + Zod (donor name, amount, frequency, campaign, fund designation)

**Key components:** `DonationCenterPage.tsx`

---

### Public Presence (`/public-presence`)

Website visibility controls, embed codes, and social sharing.

**Features:**
- Visibility Controls tab: 6 Switch toggles (event feed, donation widget, member directory, programs page, team page, impact stats) with instant feedback toasts
- Previews tab: 3 mock preview cards (Event Feed, Donation Widget, Impact Stats)
- Embed Codes tab: `<iframe>` snippets for Donation Widget and Event Feed with async clipboard copy
- Social Sharing tab: Facebook, Twitter/X, LinkedIn, Instagram — show handle/URL + copy button

**Key components:** `PublicPresencePage.tsx`

---

### Impact Dashboard (`/impact-dashboard`)

Program outcomes, milestone tracking, and AI-drafted annual report.

**Features:**
- 6 KPI cards: Beneficiaries Served, Volunteer Hours, Funds Raised, Active Programs, Events Held, New Donors
- Programs tab: 6 expandable program cards with beneficiary progress bars and outcome lists
- Milestones tab: 8 milestone items with category badges (Programs / Finance / Community / Partnerships)
- Annual Report tab: AI-drafted report via `ai-chat-assistant` edge function with graceful plain-text fallback
- Public-facing badge in page header

**Key components:** `ImpactDashboardPage.tsx`

---

### AI Engagement Scoring (`/engagement-scoring`)

AI-powered member/donor engagement scores with next-best-action recommendations.

**Features:**
- 12 demo members scored 0–100 across Active (≥70) / At Risk (40–69) / Lapsed (<40) tiers
- 4 KPI cards: Average Score, Active Members, At Risk, Lapsed
- Amber at-risk alert banner with bulk "Re-Engage All" action
- Tabbed table filtered by tier with score bar column (width driven by score %)
- Member detail Sheet: large score gauge (green/amber/red), engagement signals breakdown (positive/negative), AI Next Best Action via `ai-chat-assistant` edge function with tier-appropriate fallback

**Key components:** `AIEngagementScoringPage.tsx`

---

## Demo Data

All nonprofit modules use demo data from `src/shared/data/nonprofitDemoData.ts` and inline component state. This provides:

- Sample grants with realistic deadlines and utilization percentages
- Event attendance records with engagement tagging
- Board report KPI snapshots with financial variance data
- Data health scores and duplicate detection results
- Reconciliation transaction matches
- Donor pipeline with 8+ enriched donor profiles (giving history, fund designations, contact notes, volunteer history)
- 20 members across General / Professional / Board / Honorary tiers with status and renewal dates
- 15 volunteers with skills, availability slots, shift history, and donor crossover flags
- 5 managed events (2 Upcoming, 1 Active, 2 Past) with speakers, agenda, ticket types, and registrants
- 3 active donation campaigns + 20 recent donations + fund breakdown stats
- Public presence config (visibility toggles, social handles, embed codes)
- 6 programs with outcome metrics, 8 milestones, and impact KPIs
- 12 engagement-scored members with signal breakdowns

---

## Role-Based Dashboards

Four role-specific dashboards present nonprofit data differently:

| Role | Dashboard Component | Emphasis |
|------|-------------------|----------|
| **Executive Director** | `ExecutiveDirectorDashboard.tsx` | KPIs, board readiness, grant status, data health score |
| **Development Director** | `DevelopmentDirectorDashboard.tsx` | Donor engagement, event follow-ups, lead pipeline |
| **Finance Manager** | `FinanceManagerDashboard.tsx` | Reconciliation, fund accounting, grant spending |
| **Operations Manager** | `OperationsManagerDashboard.tsx` | Data health, integrations, AI agent status |

Each dashboard includes the `AITeamsDashboardCard` component for quick access to the AI Agent Browse system.

---

## Navigation

Nonprofit operations modules are grouped under the "NONPROFIT OPS" section in the sidebar navigation, defined in `src/shared/data/navigationStructure.ts`.

The Donor Pipeline is accessible from the "BUSINESS DEV" navigation group.
