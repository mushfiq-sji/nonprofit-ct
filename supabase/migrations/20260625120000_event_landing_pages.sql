-- Event landing page fields for marketing pages on bspcommunity.org/events/{slug}

ALTER TABLE public.nonprofit_events
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS event_end_time text,
  ADD COLUMN IF NOT EXISTS secondary_gallery_image_id uuid
    REFERENCES public.nonprofit_gallery_images(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_instructions text,
  ADD COLUMN IF NOT EXISTS map_embed_url text,
  ADD COLUMN IF NOT EXISTS hero_cta_label text NOT NULL DEFAULT 'Join Us',
  ADD COLUMN IF NOT EXISTS expectations_heading text;

CREATE UNIQUE INDEX IF NOT EXISTS nonprofit_events_slug_unique_idx
  ON public.nonprofit_events (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_nonprofit_events_secondary_gallery_image_id
  ON public.nonprofit_events (secondary_gallery_image_id)
  WHERE secondary_gallery_image_id IS NOT NULL;

COMMENT ON COLUMN public.nonprofit_events.slug IS 'Stable URL slug for /events/{slug} on the public site';
COMMENT ON COLUMN public.nonprofit_events.highlights IS 'JSON array of {title, icon?} for What to Expect section';
COMMENT ON COLUMN public.nonprofit_events.payment_instructions IS 'Zelle or other payment copy for the landing page';

-- Backfill slugs for existing rows (title-based + short id suffix for uniqueness)
UPDATE public.nonprofit_events e
SET slug = lower(
  trim(both '-' from regexp_replace(coalesce(e.title, 'event'), '[^a-zA-Z0-9]+', '-', 'g'))
) || '-' || left(replace(e.id::text, '-', ''), 8)
WHERE e.slug IS NULL;

-- Anon read ticket types for published events
GRANT SELECT ON public.nonprofit_event_ticket_types TO anon;

DROP POLICY IF EXISTS "Public can read ticket types for published events" ON public.nonprofit_event_ticket_types;
CREATE POLICY "Public can read ticket types for published events"
  ON public.nonprofit_event_ticket_types
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.nonprofit_events ev
      WHERE ev.id = nonprofit_event_ticket_types.event_id
        AND ev.is_public = true
    )
  );

-- Anon read gallery images linked to published events (cover + secondary)
DROP POLICY IF EXISTS "Public can read cover images for published events" ON public.nonprofit_gallery_images;
DROP POLICY IF EXISTS "Public can read secondary images for published events" ON public.nonprofit_gallery_images;
CREATE POLICY "Public can read images for published events"
  ON public.nonprofit_gallery_images
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.nonprofit_events e
      WHERE e.is_public = true
        AND (
          e.cover_gallery_image_id = nonprofit_gallery_images.id
          OR e.secondary_gallery_image_id = nonprofit_gallery_images.id
        )
    )
  );
