-- Event page layout templates + external banner URL for /events/{slug}
-- Safe on fresh DBs and tables created before these columns existed.

ALTER TABLE public.nonprofit_events
  ADD COLUMN IF NOT EXISTS banner_image_url text;

ALTER TABLE public.nonprofit_events
  ADD COLUMN IF NOT EXISTS page_layout text NOT NULL DEFAULT 'classic';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'nonprofit_events'
      AND column_name = 'page_layout'
  )
  AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'nonprofit_events_page_layout_check'
  ) THEN
    ALTER TABLE public.nonprofit_events
      ADD CONSTRAINT nonprofit_events_page_layout_check
      CHECK (page_layout IN ('classic', 'split', 'minimal'));
  END IF;
END $$;

COMMENT ON COLUMN public.nonprofit_events.banner_image_url IS 'External URL for hero/banner image on the public event page';
COMMENT ON COLUMN public.nonprofit_events.page_layout IS 'Landing page template: classic | split | minimal';
