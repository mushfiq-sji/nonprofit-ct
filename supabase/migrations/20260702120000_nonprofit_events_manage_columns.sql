-- Columns required by /events?tab=manage (create/edit forms + public landing flags)
ALTER TABLE public.nonprofit_events
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS event_time text,
  ADD COLUMN IF NOT EXISTS registration_url text;

COMMENT ON COLUMN public.nonprofit_events.is_public IS 'When true, event appears on the public community site';
COMMENT ON COLUMN public.nonprofit_events.event_time IS 'Start time shown on event cards and landing pages';
COMMENT ON COLUMN public.nonprofit_events.registration_url IS 'External registration URL for the Register CTA';
