-- ============================================================
-- BOOTSTRAP: Nonprofit Events schema for /events?tab=manage
-- Run in Lovable SQL Editor BEFORE supabase/seed/13-nonprofit-events.sql
-- Prerequisite: at least one row in auth.users (Quick Login user)
-- Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS)
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.nonprofit_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title       text NOT NULL,
  status      text NOT NULL CHECK (status IN ('Upcoming', 'Active', 'Past')) DEFAULT 'Upcoming',
  date        date NOT NULL,
  location    text,
  description text,
  capacity    integer NOT NULL DEFAULT 100,
  fund_raised numeric DEFAULT 0,
  event_time  text,
  registration_url text,
  is_public   boolean NOT NULL DEFAULT false,
  slug        text,
  tagline     text,
  event_end_time text,
  cover_gallery_image_id uuid,
  secondary_gallery_image_id uuid,
  highlights  jsonb NOT NULL DEFAULT '[]'::jsonb,
  payment_instructions text,
  map_embed_url text,
  hero_cta_label text NOT NULL DEFAULT 'Join Us',
  expectations_heading text,
  banner_image_url text,
  page_layout text NOT NULL DEFAULT 'classic',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS nonprofit_events_slug_unique_idx
  ON public.nonprofit_events (slug)
  WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.nonprofit_event_ticket_types (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  tier       text NOT NULL,
  price      numeric NOT NULL DEFAULT 0,
  capacity   integer NOT NULL DEFAULT 0,
  sold       integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonprofit_event_speakers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  name          text NOT NULL,
  title         text,
  bio           text,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonprofit_event_agenda_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  time          text NOT NULL,
  title         text NOT NULL,
  speaker_name  text,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonprofit_event_registrants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES public.nonprofit_events(id) ON DELETE CASCADE,
  name          text NOT NULL,
  email         text NOT NULL,
  ticket_tier   text,
  checked_in    boolean DEFAULT false,
  registered_at timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.nonprofit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_event_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_event_agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_event_registrants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users manage nonprofit events" ON public.nonprofit_events;
CREATE POLICY "Authenticated users manage nonprofit events"
  ON public.nonprofit_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage event ticket types" ON public.nonprofit_event_ticket_types;
CREATE POLICY "Authenticated users manage event ticket types"
  ON public.nonprofit_event_ticket_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage event speakers" ON public.nonprofit_event_speakers;
CREATE POLICY "Authenticated users manage event speakers"
  ON public.nonprofit_event_speakers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage event agenda" ON public.nonprofit_event_agenda_items;
CREATE POLICY "Authenticated users manage event agenda"
  ON public.nonprofit_event_agenda_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage event registrants" ON public.nonprofit_event_registrants;
CREATE POLICY "Authenticated users manage event registrants"
  ON public.nonprofit_event_registrants FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_nonprofit_events_updated_at ON public.nonprofit_events;
CREATE TRIGGER update_nonprofit_events_updated_at
  BEFORE UPDATE ON public.nonprofit_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Existing installs: CREATE TABLE IF NOT EXISTS skips new columns — add them explicitly.
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
    SELECT 1 FROM pg_constraint WHERE conname = 'nonprofit_events_page_layout_check'
  ) THEN
    ALTER TABLE public.nonprofit_events
      ADD CONSTRAINT nonprofit_events_page_layout_check
      CHECK (page_layout IN ('classic', 'split', 'minimal'));
  END IF;
END $$;

-- Event Page Designer tables: run supabase/migrations/20260702140000_event_landing_page_designer.sql next.
