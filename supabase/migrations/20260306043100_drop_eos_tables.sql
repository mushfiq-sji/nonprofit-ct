-- Migration: Drop EOS module tables
-- EOS (Entrepreneurial Operating System) is not part of the nonprofit product.
-- All EOS tables, views, and functions are removed here.

-- Drop EOS-specific tables
DROP TABLE IF EXISTS public.eos_scorecard_metrics CASCADE;
DROP TABLE IF EXISTS public.eos_scorecards CASCADE;
DROP TABLE IF EXISTS public.eos_issue_suggestions CASCADE;
DROP TABLE IF EXISTS public.eos_issues CASCADE;
DROP TABLE IF EXISTS public.eos_vto CASCADE;
DROP TABLE IF EXISTS public.eos_pods CASCADE;

-- Drop OKR tables (part of EOS module)
DROP TABLE IF EXISTS public.okr_key_results CASCADE;
DROP TABLE IF EXISTS public.okrs CASCADE;

-- Drop EOS from app_modules registry
DELETE FROM public.app_modules WHERE slug = 'eos';

-- Drop is_eos_user column from user_role_preferences (no longer needed)
ALTER TABLE public.user_role_preferences
  DROP COLUMN IF EXISTS is_eos_user;
