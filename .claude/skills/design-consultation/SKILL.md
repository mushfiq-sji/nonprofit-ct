---
name: design-consultation
description: Build a complete design system from scratch for new projects. Produces DESIGN.md as the source of truth. Run in Claude.ai for new projects only.
triggers:
  - design consultation
  - design system
  - create a brand
  - new project design
  - design from scratch
allowed-tools:
  - Read
  - Write
  - Edit
  - AskUserQuestion
---

# /design-consultation — Design System Creation

Run in **Claude.ai** for new projects only. Not for incremental changes to existing UI.

## When to Use

- Starting a new product or vertical from scratch
- A new white-label instance of the SJ Framework for a new industry
- Existing project has no `DESIGN.md` and visual direction is undefined

## Phase 0: Pre-checks

Check for existing `DESIGN.md`. If it exists, ask whether to update or start fresh.
Read `tailwind.config.ts` to understand the existing color palette, animations, and dark mode setup.
Note: the SJ Framework uses class-based dark mode and has `ai.glow`/`ai.pulse` colors already defined.

## Phase 1: Product Context (Single Question)

Ask one question covering:
- Product type and target users
- Industry and competitive context
- The "memorable thing" users should feel when they use it
- Existing brand assets (logo, colors, fonts) if any

## Phase 2: Competitive Research (Optional)

If the user wants competitive research, synthesize into:
- **Layer 1** (table stakes): What every product in this category must have
- **Layer 2** (trends): What modern products are doing
- **Layer 3** (first principles): What would be surprising and right

## Phase 3: Full Proposal

Make opinionated recommendations (never menus of options) covering:

- **Aesthetic direction**: Minimal/bold/editorial/technical/warm — pick one with rationale
- **Color palette**: 5-7 colors with hex values; primary, secondary, neutral, semantic (success/warning/error/info)
- **Typography**: 2-3 specific fonts (never Inter, Roboto, or Poppins as primary); heading, body, mono scales
- **Spacing density**: Compact/comfortable/spacious — with 4px/8px base unit recommendation
- **Motion**: Whether to use it, where, and at what duration
- **Decoration level**: Minimal to expressive — with concrete examples

Separate safe choices from deliberate creative risks.

## Phase 4: Drill-downs

Deep-dive any section the user wants to adjust. Maintain systemic coherence — individual section changes must not break the whole system.

## Phase 5: HTML Preview

Generate an HTML preview page (no external dependencies) showing:
- Font specimens at multiple sizes
- Full color palette with semantic roles and hex values
- Component examples (button, card, input, badge) using Tailwind classes
- A realistic page layout using the system

## Phase 6: Write DESIGN.md

```markdown
# Design System — [Product Name]

## Aesthetic Direction
[Choice + rationale]

## Color Palette
[Full palette with hex values, Tailwind token names, and semantic roles]

## Typography
[Font choices, scales, weights, Tailwind class references]

## Spacing
[Base unit, scale, density choice]

## Motion
[Whether used, where, timing, Tailwind animation references]

## Component Conventions
[Key visual rules, shadcn/ui component overrides]

## Decisions Log
[What was considered and why it was rejected]
```

## Stack Integration

The SJ Framework uses Tailwind CSS with:
- Dark mode: class-based strategy (`dark:` prefix)
- Custom colors already in `tailwind.config.ts`: `ai.glow`, `ai.pulse`, semantic colors
- Animations: `tailwindcss-animate` plugin
- Components: shadcn/ui (configured in `components.json`)

New design tokens go into `tailwind.config.ts`. Never hardcode hex values in components — always use Tailwind tokens.

## Anti-Slop Rules

Never recommend:
- Purple gradients as the primary palette
- Centered-everything layouts for data-dense applications
- Inter, Roboto, or Poppins as the primary typeface (fine for body/mono, not hero)
- Generic SaaS blue without strong domain rationale
