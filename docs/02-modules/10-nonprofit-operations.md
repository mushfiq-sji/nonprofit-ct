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

## Demo Data

All nonprofit modules use demo data from `src/shared/data/nonprofitDemoData.ts` and inline component state. This provides:

- Sample grants with realistic deadlines and utilization percentages
- Event attendance records with engagement tagging
- Board report KPI snapshots with financial variance data
- Data health scores and duplicate detection results
- Reconciliation transaction matches
- Donor pipeline with 8+ enriched donor profiles (giving history, fund designations, contact notes, volunteer history)

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
