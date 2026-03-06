-- Migration: Remove ActiveCollab-specific columns from projects table
-- ActiveCollab sync is removed; replaced by generic external provider pattern.

ALTER TABLE public.projects DROP COLUMN IF EXISTS ac_project_id;
ALTER TABLE public.projects DROP COLUMN IF EXISTS ac_last_sync;
ALTER TABLE public.projects DROP COLUMN IF EXISTS ac_sync_status;

-- Drop AC-specific data_source_type enum value by updating existing rows
-- (Enum values can't be dropped in PostgreSQL, but we remove the application usage)
UPDATE public.projects
  SET external_provider = NULL
  WHERE external_provider = 'activecollab';
