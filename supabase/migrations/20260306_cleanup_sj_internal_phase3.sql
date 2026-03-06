-- ============================================================================
-- Phase 3 Cleanup: Drop SJ-Internal Productivity Tables
-- ============================================================================
-- Removes tables that tracked employee productivity metrics, which are specific
-- to SJ Innovation's HR/productivity system and not needed for nonprofit management.
--
-- KEPT (nonprofit platform uses these):
--   - pods, pod_members/pod_employees (team management)
--   - employee_profiles (user/member profiles)
--   - departments (organizational structure)
--   - process_categories, process_documents (knowledge base)
--
-- DROPPED (SJ-specific):
--   - productivity_records (employee weekly metrics)
--   - leave_events (employee time-off tracking)
--   - productivity_alerts (AI alerts on productivity)
--   - ai_productivity_insights (AI insights on productivity)
-- ============================================================================

-- Drop dependent views first (if any exist)
DROP VIEW IF EXISTS pm_team_capacity CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS ai_productivity_insights CASCADE;
DROP TABLE IF EXISTS productivity_alerts CASCADE;
DROP TABLE IF EXISTS leave_events CASCADE;
DROP TABLE IF EXISTS productivity_records CASCADE;

-- Note: Do NOT drop pods, pod_members, pod_employees, employee_profiles, departments,
--       process_categories, or process_documents as these are used by pod management
--       and organizational structure features.
