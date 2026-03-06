# NonProfit Control Tower — Cleanup & Audit Report

**Date:** 2026-03-06
**Branch:** `claude/cleanup-audit-nonprofit-CP7Kp`
**Scope:** Master cleanup removing all SJ Innovation-internal code; re-brand as NonProfit Control Tower

---

## 1. Cleanup Verification — Grep Counts (All Must Be 0)

| Target | Pattern | Count | Status |
|--------|---------|-------|--------|
| HubSpot in `src/` | `hubspot\|HubSpot` | 0 | ✅ CLEAN |
| ActiveCollab in `src/` | `activecollab\|ActiveCollab` | 0 | ✅ CLEAN |
| EOS in `src/` | `\bEOS\b\|eos_` | 0 | ✅ CLEAN |
| Productivity module in `src/modules/` | `Productivity\|productivity` | 0 | ✅ CLEAN |
| SJ Innovation branding in `src/` | `sjinnovation\.us\|SJ Innovation` | 0 | ✅ CLEAN |
| EOS table queries in `supabase/functions/` | `eos_issues\|eos_scorecard\|eos_vto` | 0 | ✅ CLEAN |
| EOS framework language in edge functions | `EOS \(Entrepreneurial` | 0 | ✅ CLEAN |
| HubSpot adapter in `supabase/functions/` | `_shared/crm/adapters/hubspot` | 0 | ✅ CLEAN |

---

## 2. Build Status

```
npm run build:dev → ✅ SUCCESS (35.68s)
```

Only pre-existing chunk size warnings remain (main bundle ~3.8MB gzipped to 968KB — pre-existing, not introduced by cleanup).

`npm run lint` → ESLint has a pre-existing `ERR_MODULE_NOT_FOUND` for `@eslint/js` package (baseline state before this session, not introduced by cleanup).

---

## 3. What Was Removed

### 3.1 Modules / Code Directories

| Removed | Type | Notes |
|---------|------|-------|
| `src/modules/eos/` | Module directory | Did not exist as directory — references were scattered throughout codebase |
| `src/modules/productivity/` | Module directory | Did not exist as directory — references were scattered throughout codebase |

### 3.2 Deleted Files

| File | Reason |
|------|--------|
| `src/hooks/usePromoteIssueToEOS.ts` | EOS placeholder hook |
| `src/hooks/useActiveCollabTasks.ts` | ActiveCollab placeholder hook |
| `src/components/projects/integrations/ActiveCollabReportCard.tsx` | AC placeholder |
| `src/components/projects/ActiveCollabConnectionFlow.tsx` | AC placeholder |
| `src/components/projects/ActiveCollabTasks.tsx` | AC placeholder |
| `src/components/projects/ActiveCollabConnectionCard.tsx` | AC placeholder |
| `src/components/projects/ActiveCollabTasksList.tsx` | AC placeholder |
| `src/components/projects/ACProjectMatcher.tsx` | AC placeholder |
| `src/components/projects/ActiveCollabConnection.tsx` | AC placeholder |
| `supabase/functions/eos-triage-assistant/` | EOS AI edge function |
| `supabase/functions/analyze-okr-progress/` | EOS OKR edge function |
| `supabase/functions/okr-update-reminder/` | EOS OKR edge function |
| `supabase/functions/suggest-okrs/` | EOS OKR edge function |
| `supabase/functions/sync-action-item-to-ac/` | ActiveCollab sync edge function |
| `supabase/functions/_shared/crm/adapters/hubspot.ts` | HubSpot CRM adapter |

### 3.3 Database Migrations Added (Forward-Only)

| Migration File | Purpose |
|----------------|---------|
| `20260306043100_drop_eos_tables.sql` | Drops all EOS/OKR tables + `is_eos_user` column |
| `20260306043200_drop_productivity_tables.sql` | Drops all Productivity/CollabAI tables |
| `20260306043300_drop_activecollab_columns.sql` | Drops `ac_project_id`, `ac_last_sync`, `ac_sync_status` from projects |
| `20260306043400_crm_agnostic_layer.sql` | Creates generic `crm_integrations` + `crm_object_mappings`; drops HubSpot columns |

### 3.4 Dropped Database Tables

| Table | Category |
|-------|---------|
| `eos_scorecard_metrics` | EOS |
| `eos_scorecards` | EOS |
| `eos_issue_suggestions` | EOS |
| `eos_issues` | EOS |
| `eos_vto` | EOS |
| `eos_pods` | EOS |
| `okr_key_results` | EOS/OKR |
| `okrs` | EOS/OKR |
| `MonthwiseEmployeeProductivityDetails` | Productivity |
| `EmployeeProductivity` | Productivity |
| `ActionItem` | Productivity |
| `Employee` | Productivity |
| `EmployeeDHS` | Productivity |
| `SJIHolidays` | Productivity |

### 3.5 Dropped Database Columns

| Table | Column(s) Dropped |
|-------|------------------|
| `clients` | `hubspot_company_id`, `is_hubspot_synced`, `last_hubspot_sync` |
| `deals` | `hubspot_deal_id`, `is_hubspot_synced`, `last_hubspot_sync` |
| `contacts` | `hubspot_contact_id`, `is_hubspot_synced`, `last_hubspot_sync` |
| `projects` | `ac_project_id`, `ac_last_sync`, `ac_sync_status` |
| `user_role_preferences` | `is_eos_user` |

### 3.6 CRM Type Enum — Removed Values

From `data_source_type` PostgreSQL enum and TypeScript types:
- Removed: `hubspot`, `zoho`, `pipedrive`
- Added: `little_green_light`

---

## 4. What Was Added / Changed

### 4.1 New Database Tables

| Table | Purpose |
|-------|---------|
| `crm_integrations` | CRM-agnostic integration registry (salesforce, bloomerang, neon_crm, little_green_light, blackbaud, virtuous, donorperfect, kindful, custom) |
| `crm_object_mappings` | External CRM ID ↔ local record mapping for any CRM provider |

Both tables have RLS enabled with appropriate policies.

### 4.2 Updated Components / Files

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Removed `isEosUser` from Profile interface and fetch query |
| `src/hooks/useAgencyRole.ts` | Removed `isEosUser` from return value |
| `src/hooks/useAgencyRoleAdmin.ts` | Removed `is_eos_user` from DB interface and mutations |
| `src/pages/admin/AgencyRoles.tsx` | Removed EOS toggle column and UI |
| `src/components/dashboards/RoleSetupModal.tsx` | Removed EOS toggle, updated labels to nonprofit language |
| `src/pages/admin/SeedRunner.tsx` | Removed EOS seed file import |
| `src/pages/Feedback.tsx` | Removed EOS and Productivity from category options |
| `src/pages/Help.tsx` | Updated description to remove EOS reference |
| `src/components/landing/AITeamShowcase.tsx` | Removed "EOS Coach" AI agent entry |
| `src/components/dashboard/AIAgentGuidePopover.tsx` | Removed `eos-coach` agent context entry |
| `src/pages/dashboards/OwnerDashboard.tsx` | Updated comment to generic language |
| `src/pages/admin/ProductRoadmap.tsx` | Rebranded as NonProfit Control Tower; removed EOS/Productivity/HubSpot/AC from roadmap |
| `src/shared/data/implementationStatus.ts` | Replaced AC and HubSpot with Jira and generic CRM layer |
| `src/components/common/DataSourceBadge.tsx` | Replaced hubspot/zoho/pipedrive with nonprofit CRMs |
| `src/components/common/CrmConnectionBanner.tsx` | Removed HubSpot slugs; added little-green-light |
| `src/lib/webhook-handlers.ts` | Removed HubSpot webhook provider and signature verification |
| `src/lib/integration-utils.ts` | Replaced HubSpot with nonprofit CRM providers |
| `src/integrations/supabase/types.ts` | Removed is_eos_user, hubspot/zoho/pipedrive from enum; added little_green_light |
| `supabase/functions/validate-api-key/index.ts` | Removed HubSpot validation case |
| `supabase/functions/crm-sync/index.ts` | Removed HubSpot slugs; added little-green-light |
| `supabase/functions/extract-meeting-issues/index.ts` | Removed EOS/IDS framework language |
| `supabase/functions/quarterly-digest/index.ts` | Removed eos_issues/okrs/eos_scorecard_metrics queries; now uses meetings + projects |
| `src/modules/projects/types/index.ts` | Replaced `activecollab` source with `external` |
| `src/modules/projects/hooks/useProjectTasks.ts` | Replaced `activecollab` source with `external` |
| `src/modules/projects/components/IntegrationsTab.tsx` | Removed ActiveCollab slug check |
| `src/modules/projects/components/TasksTab.tsx` | Updated empty state text |
| `src/components/projects/CreateProjectDialog.tsx` | Removed AC search UI |
| `src/pages/admin/ProviderDetail.tsx` | Removed ActiveCollab slug check |
| `src/hooks/useIntegrationSync.ts` | Removed ActiveCollab sync function mapping |
| `src/pages/admin/integrations/SendGrid.tsx` | Updated brand name in test email |

---

## 5. Active Architecture Snapshot

### 5.1 Active Modules (7)

| Module | Directory | Status |
|--------|-----------|--------|
| platform | `src/modules/platform/` | Core — always active |
| admin | `src/modules/admin/` | Core — always active |
| actions | `src/modules/actions/` | Feature flag: `VITE_MODULE_ACTIONS` |
| meetings | `src/modules/meetings/` | Feature flag: `VITE_MODULE_MEETINGS` |
| knowledge | `src/modules/knowledge/` | Feature flag: `VITE_MODULE_KNOWLEDGE` |
| projects | `src/modules/projects/` | Feature flag: `VITE_MODULE_PROJECTS` |
| business-dev | `src/modules/business-dev/` | Feature flag: `VITE_MODULE_BUSINESS_DEV` |

**Removed:** `eos` (never a directory — references cleaned), `productivity` (never a directory — references cleaned)

### 5.2 Active Route Groups

```
Public:      /login, /signup, /auth/callback
Core:        /dashboard (owner/pm/ic), /profile, /settings
Business:    /clients, /deals, /contacts, /lead-followup
Meetings:    /meetings, /meetings/:id
Actions:     /tasks
Knowledge:   /knowledge, /knowledge/:id
Projects:    /projects, /projects/:id
Admin:       /admin/* (40+ admin pages)
Client:      /client/* (token-based portal)
```

### 5.3 Active Edge Functions (115 remaining after deletions)

Key functions by domain:

**AI / Agents:**
`ai-chat`, `ai-chat-assistant`, `agent-chat-stream`, `agent-conversation-chat`, `run-ai-agent`, `orchestrate-agent-team`, `deal-coach`, `enforce-guardrails`, `validate-guardrails`

**Meetings:**
`generate-meeting-summary`, `generate-meeting-summary-v2`, `extract-meeting-issues` (updated), `extract-meeting-action-items`, `extract-meeting-tasks`, `parse-meeting-action-items`, `categorize-meeting`, `compile-meeting-summary`, `quarterly-digest` (updated), `sync-google-meet`, `create-zoom-meeting`, `zoom-cron-sync`

**Knowledge:**
`knowledge-base`, `semantic-search`, `unified-knowledge-search`, `generate-embeddings`, `auto-embed-knowledge-entry`, `auto-embed-knowledge-files`

**CRM / Business Dev:**
`crm-sync`, `lead-followup-research`, `generate-conversation-opener`

**Projects / Integrations:**
`sync-projects-jira`, `sync-workboard-action-items`

**Auth / OAuth:**
`oauth-authorize`, `oauth-exchange-token`, `oauth-refresh-token`, `oauth-revoke-token`, `validate-sso-domain`

**API (REST):**
`api-v1-clients`, `api-v1-documents`, `api-v1-meetings`, `api-v1-tasks`, `api-v1-zoom-files`

### 5.4 Active Core Database Tables (Kept)

| Domain | Tables |
|--------|--------|
| Auth | `profiles`, `user_roles`, `roles`, `user_role_preferences` |
| Clients/CRM | `clients`, `deals`, `contacts`, `crm_integrations` (new), `crm_object_mappings` (new) |
| Meetings | `meetings`, `meeting_transcripts`, `zoom_files` |
| Knowledge | `knowledge_entries`, `knowledge_files`, `knowledge_categories`, `knowledge_sources`, `embeddings` |
| AI | `ai_agents`, `ai_agent_runs`, `ai_chat_history`, `ai_guardrails`, `ai_usage_logs` |
| Projects | `projects`, `project_milestones` |
| Tasks | `tasks` |
| Config | `app_config`, `app_modules`, `user_module_permissions` |
| Ops | `notifications`, `feedback`, `activity_logs` |

---

## 6. What Is Built vs. Not Yet Built

### Built & Functional

- ✅ Authentication (email/password, Google OAuth, Microsoft Azure AD)
- ✅ Role-based access (admin, moderator, user) + agency role (owner, pm, ic)
- ✅ CRM: Clients, Deals, Contacts with generic CRM integration layer
- ✅ Meeting management with AI summarization, issue extraction, action items
- ✅ Knowledge base with semantic search (vector embeddings)
- ✅ Project management (milestones, tasks, Jira sync)
- ✅ Task/Actions management
- ✅ Lead follow-up with AI research
- ✅ AI Agents framework with guardrails and HITL approval
- ✅ Admin panel (40+ pages for all configuration)
- ✅ Client portal (token-based external access)
- ✅ Notifications, feedback, activity logging
- ✅ Google Drive, Zoom, Microsoft Teams integrations

### Not Yet Built (Future Roadmap)

- ⬜ Bloomerang CRM adapter (crm_integrations table is ready; needs Edge Function)
- ⬜ Neon CRM adapter (same)
- ⬜ Little Green Light adapter (same)
- ⬜ Salesforce NPSP adapter (same)
- ⬜ Donor management module (crm_object_mappings supports it)
- ⬜ Volunteer management module
- ⬜ Grant tracking module
- ⬜ Impact reporting / outcomes tracking

---

## 7. Next Steps

1. **Apply migrations** to production Supabase:
   ```bash
   npm run migrations:run
   ```

2. **Verify no runtime errors** from dropped tables (eos_issues, okrs, eos_scorecard_metrics, productivity tables) — all code references have been removed.

3. **Implement first nonprofit CRM adapter** — choose Bloomerang or Neon CRM, create `supabase/functions/crm-sync-bloomerang/` following the generic `crm_integrations` pattern.

4. **Regenerate Supabase types** once migrations are applied:
   ```bash
   supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts
   ```
   Manual edits made during this session will be superseded by the regenerated types.

5. **Update admin UI** for `crm_integrations` — create a CRM integrations admin page allowing configuration of nonprofit CRM providers.

---

## 8. Verification Commands

Run these after applying migrations to confirm clean state:

```bash
# No HubSpot references in source
grep -rn "hubspot\|HubSpot" src/ --include="*.ts" --include="*.tsx" | wc -l
# Expected: 0

# No ActiveCollab references in source
grep -rn "activecollab\|ActiveCollab" src/ --include="*.ts" --include="*.tsx" | wc -l
# Expected: 0

# No EOS references in source
grep -rn "\bEOS\b\|eos_" src/ --include="*.ts" --include="*.tsx" | wc -l
# Expected: 0

# No EOS table queries in edge functions
grep -rn "eos_issues\|eos_scorecard\|eos_vto" supabase/functions/ --include="*.ts" | wc -l
# Expected: 0

# Build passes
npm run build:dev
# Expected: ✓ built in ~35s
```

All counts verified as **0** at time of this audit. Build verified as **passing**.
