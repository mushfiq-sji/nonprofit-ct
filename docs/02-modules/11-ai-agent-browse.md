# AI Agent Browse System

The AI Agent Browse system provides a discovery experience for 16 specialized AI agents organized into 4 teams. Users browse agents, read what they do, then navigate to the functional page where the agent operates.

---

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/agents` | `AgentsBrowse.tsx` | Main browse page with team grid + individual agents |
| `/agents/:slug` | `AgentDetail.tsx` | Individual agent detail page |

Both routes are protected (require authentication) and render inside `DashboardLayout`.

---

## Data Architecture

### Static Config — `agentTeamConfig.ts`

All agent teams and their members are defined in `src/components/ai/agentTeamConfig.ts`. This is the **single source of truth** for the browse experience.

```typescript
interface AgentTeamAgent {
  name: string;           // Display name
  slug: string;           // URL slug
  description: string;    // One-line description
  icon: string;           // Lucide icon name
  capabilities?: string[];
  howToUse?: string[];
  whereToFind?: { label: string; path: string };
}

interface AgentTeamDef {
  id: string;
  name: string;
  tagline: string;
  accentColor: string;    // Tailwind border class
  gradientFrom: string;   // HSL values
  gradientTo: string;     // HSL values
  agents: AgentTeamAgent[];
}
```

### Helper Functions

- `findAgentBySlug(slug)` — Find an agent + its team by slug
- `findTeamForAgent(slug)` — Find which team an agent belongs to

---

## Agent Teams

### Donor Intelligence Team (`sales`)
| Agent | Slug | Icon |
|-------|------|------|
| Deal Coach | `deal-coach` | Trophy |
| Daily Briefing | `deal-daily-briefing` | Newspaper |
| Quick Deal Email | `quick-deal-email` | Mail |
| Deal AI Chat | `deal-ai-chat` | MessageSquare |

### Meeting AI Team (`meetings`)
| Agent | Slug | Icon |
|-------|------|------|
| Meeting Summarizer | `meeting-summarizer` | FileText |
| Action Extractor | `action-item-extractor` | ListChecks |
| Efficiency Analyzer | `meeting-efficiency-analyzer` | Gauge |
| Client Call Analyzer | `client-call-analyzer` | PhoneCall |

### Strategy AI Team (`eos`)
| Agent | Slug | Icon |
|-------|------|------|
| EOS Coach | `eos-coach` | GraduationCap |
| Pattern Detective | `eos-pattern-detective` | Search |
| Pod Health | `eos-pod-health` | HeartPulse |
| Quarterly Digest | `eos-quarterly-digest` | CalendarRange |

### Project AI Team (`projects`)
| Agent | Slug | Icon |
|-------|------|------|
| Project Analyst | `project-analyst` | BarChart3 |
| Bug & Feature Planner | `bug-feature-planner` | Bug |
| Technical Planner | `technical-plan-generator` | Cpu |
| Code Reviewer | `code-review-generator` | Code |

---

## Components

### Browse Page (`AgentsBrowse.tsx`)
- **Team Cards grid** (2-col) — overlapping gradient icons, team name, "Explore Team" button
- **Team Detail Sections** — 4-col grid of `AgentBrowseCard` components per team
- **More Agents** — database-only agents not in static config

### Agent Detail Page (`AgentDetail.tsx`)
- **Hero** — gradient banner, overlapping icon, team badge, CTA button
- **Accordion** — Capabilities, How to Use, Where to Find (all open by default)
- **Sidebar** — agent info card + related agents list

### Dashboard Card (`AITeamsDashboardCard.tsx`)
- Horizontally scrollable row of team mini-cards
- Rendered on all 4 role-specific dashboards
- "Browse All Agents →" link

### Presence Indicator (`AIAgentPresenceIndicator.tsx`)
- Animated pill with pulsing dot + sparkles + agent name
- Placed on functional pages where agents operate
- Clicking navigates to agent detail page

### Contextual Banner (`AgentTeamBanner.tsx`)
- Collapsible banner showing team icons + name
- Expanded state shows agent mini-cards
- Placed on section pages (Grants, Events, etc.)

---

## Design System

### Team Colors

| Team | gradientFrom | gradientTo | Accent |
|------|-------------|-----------|--------|
| Sales | `280 70% 50%` | `330 80% 55%` | `border-b-red-500` |
| Meetings | `190 80% 45%` | `210 85% 55%` | `border-b-blue-500` |
| Strategy | `30 90% 50%` | `45 95% 55%` | `border-b-amber-500` |
| Projects | `150 70% 40%` | `170 75% 50%` | `border-b-emerald-500` |

### Gradient Pattern
All gradients: `linear-gradient(135deg, hsl(${from}), hsl(${to}))`

### Overlapping Icons
- Flex container with negative margins (`-ml-2`, `-ml-3`)
- `ring-3 ring-background` for separation
- Descending z-index for stacking order

---

## Adding a New Agent

1. Add the agent to the appropriate team in `src/components/ai/agentTeamConfig.ts`
2. Include: `name`, `slug`, `description`, `icon`, `capabilities`, `howToUse`, `whereToFind`
3. The browse page and detail page will automatically pick it up
