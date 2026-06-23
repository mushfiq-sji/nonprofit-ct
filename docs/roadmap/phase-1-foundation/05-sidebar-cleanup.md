# Phase 1 · 05 — Sidebar Cleanup

## 1. Goal
Hide non-nonprofit modules behind a `enableLegacy` flag so the default sidebar shows only ICP-relevant pages.

## 2. User story
As a **nonprofit Executive Director**, I want **a sidebar that shows only nonprofit features**, so that **I am not overwhelmed by irrelevant tools**.

## 3. KPI moved
- First-session sidebar clicks before bouncing: **+30%**
- Onboarding wizard completion: **+15pp**

## 4. Scope (IN)
- Add `enableLegacy: boolean` to `app_modules` (default false)
- Update `src/shared/data/navigationStructure.ts` to tag legacy items
- Sidebar renderer filters out legacy items unless flag is on
- Admin → Modules page exposes the toggle

## 5. Out of scope (OUT)
- Deleting any legacy code
- Marketplace install/uninstall (Phase 4 · 01)

## 6. Files to create / change
```
src/shared/data/navigationStructure.ts        (add `legacy: true` tag where needed)
src/components/layout/AppSidebar.tsx          (filter by flag)
src/services/settings.service.ts              (add getModuleFlags / setModuleFlag)
src/pages/admin/ModulesPage.tsx               (add Legacy toggle)
supabase/migrations/<ts>_add_enable_legacy.sql
```

## 7. Data model
```sql
-- app_modules already exists; add config row:
INSERT INTO public.app_config (key, value)
VALUES ('enable_legacy', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

## 8. API surface
None.

## 9. UI spec
- Sidebar groups (default ON): Dashboard, Fundraising, Grants, People, Events, Reporting + AI, Intelligence, Settings
- Items tagged `legacy: true` (Pods, MCP Servers, Zoom-specific pages, Jira sync, ClickUp sync, Workboard sync, generic Projects)
- Admin → Modules → "Show legacy modules" toggle (admin-only)

## 10. Acceptance criteria
- [ ] Default sidebar has no legacy items
- [ ] Admin can toggle legacy on; sidebar updates without reload
- [ ] No routes are removed (still accessible by URL — just hidden)
- [ ] `npm run lint` + `build` pass

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-1-foundation/05-sidebar-cleanup.md

Tag legacy nav items in navigationStructure.ts. Implement the flag via app_config. Filter in AppSidebar. Add an admin toggle. Do not delete any pages.

Follow service-layer rule: read/write the flag via settings.service.ts. Run gstack.
```
