-- Event Page Designer: landing page registry + activity log for /agents/event-page-designer

CREATE TABLE IF NOT EXISTS public.nonprofit_event_landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  event_title text NOT NULL,
  slug text,
  page_layout text NOT NULL DEFAULT 'classic',
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nonprofit_event_landing_pages_event_id_key UNIQUE (event_id),
  CONSTRAINT nonprofit_event_landing_pages_page_layout_check
    CHECK (page_layout IN ('classic', 'split', 'minimal'))
);

CREATE INDEX IF NOT EXISTS idx_nonprofit_event_landing_pages_event_id
  ON public.nonprofit_event_landing_pages (event_id);

CREATE INDEX IF NOT EXISTS idx_nonprofit_event_landing_pages_updated_at
  ON public.nonprofit_event_landing_pages (updated_at DESC);

CREATE TABLE IF NOT EXISTS public.nonprofit_event_landing_page_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  landing_page_id uuid REFERENCES public.nonprofit_event_landing_pages(id) ON DELETE SET NULL,
  action text NOT NULL,
  event_title text NOT NULL,
  page_layout text,
  summary text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nonprofit_event_landing_page_activity_action_check
    CHECK (action IN ('configured', 'updated', 'published', 'unpublished', 'deleted'))
);

CREATE INDEX IF NOT EXISTS idx_nonprofit_event_landing_page_activity_event_id
  ON public.nonprofit_event_landing_page_activity (event_id);

CREATE INDEX IF NOT EXISTS idx_nonprofit_event_landing_page_activity_created_at
  ON public.nonprofit_event_landing_page_activity (created_at DESC);

ALTER TABLE public.nonprofit_event_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_event_landing_page_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users manage event landing pages" ON public.nonprofit_event_landing_pages;
CREATE POLICY "Authenticated users manage event landing pages"
  ON public.nonprofit_event_landing_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage event landing page activity" ON public.nonprofit_event_landing_page_activity;
CREATE POLICY "Authenticated users manage event landing page activity"
  ON public.nonprofit_event_landing_page_activity FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_nonprofit_event_landing_pages_updated_at ON public.nonprofit_event_landing_pages;
CREATE TRIGGER update_nonprofit_event_landing_pages_updated_at
  BEFORE UPDATE ON public.nonprofit_event_landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.nonprofit_event_landing_pages IS 'Registry of configured event landing pages for Event Page Designer agent';
COMMENT ON TABLE public.nonprofit_event_landing_page_activity IS 'Activity log when landing pages are saved, published, or removed';

-- Backfill registry from events that already have landing content
INSERT INTO public.nonprofit_event_landing_pages (
  event_id,
  event_title,
  slug,
  page_layout,
  is_published,
  created_by,
  created_at,
  updated_at
)
SELECT
  e.id,
  e.title,
  e.slug,
  COALESCE(NULLIF(e.page_layout, ''), 'classic'),
  COALESCE(e.is_public, false),
  e.created_by,
  COALESCE(e.updated_at, e.created_at, now()),
  COALESCE(e.updated_at, e.created_at, now())
FROM public.nonprofit_events e
WHERE
  COALESCE(e.is_public, false) = true
  OR NULLIF(trim(e.banner_image_url), '') IS NOT NULL
  OR NULLIF(trim(e.tagline), '') IS NOT NULL
  OR NULLIF(trim(e.payment_instructions), '') IS NOT NULL
  OR NULLIF(trim(e.expectations_heading), '') IS NOT NULL
  OR (
    e.highlights IS NOT NULL
    AND jsonb_typeof(e.highlights) = 'array'
    AND jsonb_array_length(e.highlights) > 0
  )
ON CONFLICT (event_id) DO UPDATE SET
  event_title = EXCLUDED.event_title,
  slug = EXCLUDED.slug,
  page_layout = EXCLUDED.page_layout,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;

-- Seed one activity row per backfilled landing page (skip if activity already exists for event)
INSERT INTO public.nonprofit_event_landing_page_activity (
  event_id,
  landing_page_id,
  action,
  event_title,
  page_layout,
  summary,
  created_by,
  created_at
)
SELECT
  lp.event_id,
  lp.id,
  CASE WHEN lp.is_published THEN 'published' ELSE 'configured' END,
  lp.event_title,
  lp.page_layout,
  CASE
    WHEN lp.is_published THEN
      'Published ' || lp.event_title || ' — ' ||
      CASE lp.page_layout
        WHEN 'split' THEN 'Full-Width Banner'
        WHEN 'minimal' THEN 'Minimal'
        ELSE 'Classic Hero'
      END || ' layout'
    ELSE
      'Landing page configured for ' || lp.event_title || ' — ' ||
      CASE lp.page_layout
        WHEN 'split' THEN 'Full-Width Banner'
        WHEN 'minimal' THEN 'Minimal'
        ELSE 'Classic Hero'
      END || ' (draft)'
  END,
  lp.created_by,
  lp.updated_at
FROM public.nonprofit_event_landing_pages lp
WHERE NOT EXISTS (
  SELECT 1
  FROM public.nonprofit_event_landing_page_activity a
  WHERE a.event_id = lp.event_id
);
