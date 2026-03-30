

# Sidebar Cleanup — Role-Tailored Navigation

## Problem
All demo roles (Executive Director, Development Director, Finance Manager, Operations Manager) see the same sidebar with all 6 nonprofit-ops items plus any module-gated groups. Shahed wants a clean, role-appropriate sidebar — not everything for everyone.

## Proposed Sidebar Per Role

| Item | Exec. Director | Dev. Director | Finance Mgr | Ops Manager |
|------|:-:|:-:|:-:|:-:|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Grants | ✓ | ✓ | ✓ | — |
| Events | ✓ | ✓ | — | — |
| Board Reports | ✓ | — | — | — |
| Data Health | ✓ | — | ✓ | ✓ |
| Reconciliation | — | — | ✓ | ✓ |
| Browse Agents | ✓ | ✓ | ✓ | ✓ |

**Rationale**: ED sees everything (7 items). DD focuses on donor-facing work (Grants, Events, Agents = 4). FM focuses on financial accuracy (Grants, Data Health, Reconciliation, Agents = 5). OM focuses on operational data (Data Health, Reconciliation, Agents = 4). Admins always see all.

## Items to Remove/Move
- **Meetings group** — already module-gated, but add `adminOnly: true` so it only shows for admins
- **Knowledge group** — add `adminOnly: true` so it only shows for admins
- **"My Chat" / AI Chat** — not present in current nav (already clean)
- **Integration Center** — check if it exists in nav and remove if so (admin-only feature)

## Changes

### 1. `src/shared/data/navigationStructure.ts`
- Add `agencyRoles` to each item in the `nonprofit-ops` group per the table above
- Add `adminOnly: true` to the `meetings` group
- Add `adminOnly: true` to the `knowledge` group
- Remove the `nonprofit-ops` group-level collapsible wrapper — render its items as flat top-level links (no group header needed since it's the only visible group for regular users)

### 2. `src/components/layout/AppSidebar.tsx`
- Change default `expandedGroups` initialization: default all groups to **collapsed** (`false`) instead of expanded (`true`), except `nonprofit-ops` which stays open
- This prevents information overload for admin users who do see multiple groups

### 3. No other files change
No routing, auth, or page changes needed.

## Technical Detail
The `agencyRoles` filter on `NavItem` already works in `AppSidebar.tsx` — the `isItemVisible` function checks `item.agencyRoles` and hides items whose role list doesn't include the current user's agency role. Admins bypass this check entirely.

