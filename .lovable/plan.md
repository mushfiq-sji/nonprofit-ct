

# Sidebar & Demo Cleanup — Reduce Confusion, Make Demo-Ready

## The Problems

1. **Two "AI Agents" entries** — "Browse Agents" (`/agents`) in the main sidebar AND "AI Agents" (`/ai-agents`) in the admin-only "AI" group. Even admins see both, which is confusing.

2. **"Browse Agents" visible to ALL roles** — no `agencyRoles` filter, so Finance Managers and Operations Managers see AI agent discovery they don't need.

3. **Too many sidebar items for some roles** — e.g., Development Director sees 5+ items. Some pages (like `/ai-agents` operational page) show loading spinners or empty states because they depend on database data that isn't seeded.

4. **Non-functional pages in the sidebar** — `/ai-agents`, `/ai-agents/:id` pages pull from the `ai_agents` database table which may have no data, leading to blank screens during demos.

## Proposed Changes

### 1. Remove "AI Agents" admin-only group from sidebar
The `ai` group (id: `ai`, line 217-229 in navigationStructure.ts) contains only `/ai-agents` which overlaps with Browse Agents. Remove this group entirely — admin AI agent management already exists at `/admin/ai/agents`.

### 2. Restrict "Browse Agents" to relevant roles
Add `agencyRoles: ["executive_director", "development_director", "operations_manager"]` to the Browse Agents nav item. Finance Managers don't need agent discovery.

### 3. Clean up per-role sidebar items

Final sidebar per role:

| Item | Exec. Dir | Dev. Dir | Finance | Ops Mgr |
|------|-----------|----------|---------|---------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Data Health | ✓ | — | ✓ | ✓ |
| Reconciliation | — | — | ✓ | ✓ |
| Events | ✓ | ✓ | — | — |
| Grants | ✓ | ✓ | ✓ | — |
| Board Reports | ✓ | — | — | — |
| Donor Pipeline | ✓ | ✓ | — | — |
| Browse Agents | ✓ | ✓ | — | ✓ |

This gives: ED=6, DD=4, FM=3, OM=3 — clean and focused.

### 4. Remove the standalone `/ai-agents` route from non-admin nav
Keep the route alive (admin can still access it directly), but remove it from the sidebar navigation group so it doesn't confuse demo users.

## Files Changed

1. **`src/shared/data/navigationStructure.ts`**
   - Remove the `ai` group (lines 216-229)
   - Add `agencyRoles` filter to "Browse Agents" item
   - Remove Finance Manager from Browse Agents visibility

## What stays the same
- All pages remain routable (no route deletions)
- Admin panel navigation unchanged
- Agent browse and detail pages unchanged
- Donor Pipeline page unchanged
- All demo data intact

