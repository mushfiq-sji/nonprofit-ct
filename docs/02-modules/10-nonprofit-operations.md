# Nonprofit Operations Modules

The Nonprofit Control Tower includes five operational modules designed specifically for nonprofit organizations. These modules surface insights from connected CRM and finance systems — they are **not data entry tools**.

---

## Modules

### Grants Management (`/grants`)

Track grant lifecycle, deadlines, and fund utilization.

**Features:**
- Active grants list with status indicators
- Upcoming deadline alerts
- Fund utilization progress bars
- Spending alerts
- Generate Compliance Summary action

**Key components:** `GrantsManagement.tsx` in the nonprofit-ops pages

---

### Events (`/events`)

Post-event engagement intelligence from connected event platforms.

**Features:**
- Recent events with attendance data
- Engagement tagging (attendee → donor, volunteer, etc.)
- Volunteer interest flags
- Follow-up suggestions from AI
- Create Follow-Up Task action

---

### Board Reports (`/board-reports`)

Generate board-ready reports from aggregated data.

**Features:**
- KPI Summary cards
- Financial Snapshot
- Engagement Metrics
- Download PDF button
- Generate New Draft button

---

### Data Health (`/data-health`)

Surface CRM data quality issues from connected systems.

**Features:**
- Duplicate probability list with confidence scores
- Incomplete profile list (missing fields)
- Household inconsistencies
- Soft credit alerts
- Merge suggestion preview with Approve/Review actions

**UI Pattern:** Insight cards with action buttons, NOT record tables.

---

### Reconciliation (`/reconciliation`)

Match transactions across payment processors and CRM/finance systems.

**Features:**
- Unmatched transactions list
- Fee variance alerts
- Restricted fund mismatches
- Monthly reconciliation summary
- Export Reconciliation Report
- Mark as Balanced action

---

## Demo Data

All nonprofit modules use demo data from `src/shared/data/nonprofitDemoData.ts`. This file provides:

- Sample grants with realistic deadlines and utilization percentages
- Event attendance records
- Board report KPI snapshots
- Data health scores and duplicate detection results
- Reconciliation transaction matches

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
