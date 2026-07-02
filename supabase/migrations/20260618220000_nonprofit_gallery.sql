-- ============================================================================
-- Migration: Nonprofit Gallery
-- Public gallery image storage + metadata for BSP event gallery.
-- ============================================================================

-- Public bucket for website-safe gallery images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  updated_at = now();

-- Authenticated users can manage gallery objects. Public reads are handled by
-- the bucket's public flag.
DROP POLICY IF EXISTS "Authenticated users upload gallery images" ON storage.objects;
CREATE POLICY "Authenticated users upload gallery images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Authenticated users update gallery images" ON storage.objects;
CREATE POLICY "Authenticated users update gallery images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery-images')
  WITH CHECK (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Authenticated users delete gallery images" ON storage.objects;
CREATE POLICY "Authenticated users delete gallery images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery-images');

CREATE TABLE IF NOT EXISTS public.nonprofit_gallery_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title        text,
  caption      text,
  category     text NOT NULL CHECK (category IN ('Personal Finance','Technology','Community','Sports')),
  storage_path text NOT NULL,
  file_name    text NOT NULL,
  file_type    text,
  file_size    integer,
  sort_order   integer DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nonprofit_gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read gallery images" ON public.nonprofit_gallery_images;
CREATE POLICY "Anyone can read gallery images"
  ON public.nonprofit_gallery_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users manage gallery images" ON public.nonprofit_gallery_images;
CREATE POLICY "Authenticated users manage gallery images"
  ON public.nonprofit_gallery_images FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_nonprofit_gallery_images_category
  ON public.nonprofit_gallery_images(category);

CREATE INDEX IF NOT EXISTS idx_nonprofit_gallery_images_created_at
  ON public.nonprofit_gallery_images(created_at DESC);

DROP TRIGGER IF EXISTS update_nonprofit_gallery_images_updated_at ON public.nonprofit_gallery_images;
CREATE TRIGGER update_nonprofit_gallery_images_updated_at
  BEFORE UPDATE ON public.nonprofit_gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed module toggle row. Off by default so Custom mode can opt in.
INSERT INTO public.app_modules (
  name, slug, description, icon, category, is_core, is_active, sort_order, page_route
) VALUES (
  'Gallery',
  'gallery',
  'Public image gallery with event and community category filters',
  'Images',
  'nonprofit',
  false,
  false,
  120,
  '/events/gallery'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  is_core = EXCLUDED.is_core,
  page_route = EXCLUDED.page_route,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Role-gating support: mirror Events access for the gallery module.
INSERT INTO public.nonprofit_role_permissions (role, resource_type, resource_key, granted)
VALUES
  ('executive_director', 'module', 'gallery', true),
  ('development_director', 'module', 'gallery', true)
ON CONFLICT (role, resource_type, resource_key) DO UPDATE SET
  granted = EXCLUDED.granted;
