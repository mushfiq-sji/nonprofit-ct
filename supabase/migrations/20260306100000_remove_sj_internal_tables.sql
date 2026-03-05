-- Migration: Remove SJ Innovation internal tables not needed for nonprofit version
-- These tables powered SJ's internal HR tracking, CollabAI analytics,
-- API documentation tools, and EOS issues — none needed for the nonprofit product.

-- ============================================================================
-- Group 1: Employee Productivity & HR (SJ-Internal)
-- ============================================================================

-- Drop views/functions that depend on these tables first
DROP FUNCTION IF EXISTS public.get_latest_productivity_week() CASCADE;
DROP FUNCTION IF EXISTS public.get_productivity_metrics(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_manager_reports(text) CASCADE;

DROP TABLE IF EXISTS public."MonthwiseEmployeeProductivityDetails" CASCADE;
DROP TABLE IF EXISTS public."EmployeeProductivity" CASCADE;
DROP TABLE IF EXISTS public."ActionItem" CASCADE;
DROP TABLE IF EXISTS public."Employee" CASCADE;
DROP TABLE IF EXISTS public."EmployeeDHS" CASCADE;
DROP TABLE IF EXISTS public."SJIHolidays" CASCADE;

-- ============================================================================
-- Group 2: CollabAI Analytics (SJ-Internal AI Dashboard)
-- ============================================================================

DROP TABLE IF EXISTS public."CollabAIAssistant" CASCADE;
DROP TABLE IF EXISTS public."CollabAIUsers" CASCADE;
DROP TABLE IF EXISTS public."CollabAIUses" CASCADE;
DROP TABLE IF EXISTS public."AssistantDetails" CASCADE;
DROP TABLE IF EXISTS public."AssistantUsageRecord" CASCADE;
DROP TABLE IF EXISTS public."AIUsage" CASCADE;
DROP TABLE IF EXISTS public."TokenUsage" CASCADE;
DROP TABLE IF EXISTS public."ApiAssistant" CASCADE;
DROP TABLE IF EXISTS public."ApiUser" CASCADE;
DROP TABLE IF EXISTS public."ApiTeam" CASCADE;
DROP TABLE IF EXISTS public."AssistantMetaData" CASCADE;

-- ============================================================================
-- Group 3: Finance / Revenue Projection
-- ============================================================================

DROP TABLE IF EXISTS public."RevenueProjection" CASCADE;

-- ============================================================================
-- Group 4: API Management (Internal Dev Tool)
-- ============================================================================

-- Note: Only dropping the API management tables, NOT knowledge_categories
-- or other tables with similar generic names.
DROP TABLE IF EXISTS public."Endpoint" CASCADE;
DROP TABLE IF EXISTS public."Category" CASCADE;
DROP TABLE IF EXISTS public."RawDataLog" CASCADE;

-- ============================================================================
-- Group 5: EOS Issues
-- ============================================================================

DROP TABLE IF EXISTS public.eos_issues CASCADE;
