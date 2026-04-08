

# Clean Up Agents Page — Show Only Nonprofit-Relevant Agents

## Problem

The `/agents` page currently shows **6 agent teams with ~22 agents**. Only 1 team ("Core Operations Team" with 5 agents) is relevant to the nonprofit demo. The other 5 teams (Donor Intelligence, Meeting AI, Strategy AI, Project AI) are legacy holdovers from the old product and clutter the page, making it confusing for demos.

Your S3 changes (core agent cards with real findings) ARE live — they're just buried under all the legacy teams.

## What Changes

### 1. Remove legacy teams from `agentTeamConfig.ts`

Delete these 4 teams and all their agents:
- `sales` (Donor Intelligence Team — 4 legacy agents like "Deal Coach")
- `meetings` (Meeting AI Team — 4 agents)
- `eos` (Strategy AI Team — 4 agents)
- `projects` (Project AI Team — 4 agents)

**Keep only**: `nonprofit-ops` (Core Operations Team — 5 agents with real findings data)

Also clean up the corresponding entries in `AGENT_ICON_MAP` and `CATEGORY_COLORS`.

### 2. Simplify the browse page layout

With only 1 team, the "Team Cards grid" section (which lets you scroll between teams) becomes unnecessary. Remove it and show the 5 core agent cards directly in a clean grid — no intermediate "team card" navigation step.

### 3. Clean up `AGENT_META` in `AgentsBrowse.tsx`

Remove the demo metadata entries for the 16 deleted agents (deal-coach, meeting-summarizer, eos-coach, etc.) — only keep entries for core agents if needed.

## Result

The `/agents` page will show:
- Page header + activity banner
- 5 agent cards in a clean grid, each with real findings, "Run Now", and "View Findings"
- No confusing team navigation, no legacy agents

## Files Changed

1. **`src/components/ai/agentTeamConfig.ts`** — Remove 4 legacy teams, clean up icon map and color map
2. **`src/pages/AgentsBrowse.tsx`** — Remove legacy AGENT_META entries, simplify layout (remove TeamCard grid, show agents directly)

