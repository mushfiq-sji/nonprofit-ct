-- Link nonprofit events to gallery images for public website cover photos.

ALTER TABLE public.nonprofit_events
  ADD COLUMN IF NOT EXISTS cover_gallery_image_id uuid
  REFERENCES public.nonprofit_gallery_images(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_nonprofit_events_cover_gallery_image_id
  ON public.nonprofit_events (cover_gallery_image_id)
  WHERE cover_gallery_image_id IS NOT NULL;
