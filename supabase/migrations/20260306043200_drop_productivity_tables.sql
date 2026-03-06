-- Migration: Drop Productivity module tables
-- SJ Innovation internal HR/productivity tracking removed from nonprofit product.

-- Drop productivity/HR tables (camelCase variants used by SJ)
DROP TABLE IF EXISTS public."MonthwiseEmployeeProductivityDetails" CASCADE;
DROP TABLE IF EXISTS public."EmployeeProductivity" CASCADE;
DROP TABLE IF EXISTS public."ActionItem" CASCADE;
DROP TABLE IF EXISTS public."Employee" CASCADE;
DROP TABLE IF EXISTS public."EmployeeDHS" CASCADE;
DROP TABLE IF EXISTS public."SJIHolidays" CASCADE;

-- Drop snake_case variants if they exist
DROP TABLE IF EXISTS public.employee_productivity CASCADE;
DROP TABLE IF EXISTS public.monthwise_employee_productivity_details CASCADE;
DROP TABLE IF EXISTS public.employee_dhs CASCADE;
DROP TABLE IF EXISTS public.sji_holidays CASCADE;

-- Drop productivity functions
DROP FUNCTION IF EXISTS public.get_latest_productivity_week() CASCADE;
DROP FUNCTION IF EXISTS public.get_productivity_metrics(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_manager_reports(text) CASCADE;

-- Remove from app_modules registry
DELETE FROM public.app_modules WHERE slug = 'productivity';
