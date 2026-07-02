import { getGalleryPublicUrl } from "@/hooks/useGalleryImages";

interface EventBannerSource {
  banner_image_url?: string | null;
  cover_gallery_image_id?: string | null;
}

interface GalleryImageRow {
  id: string;
  publicUrl: string;
}

/** Prefer explicit banner URL, then gallery cover image. */
export function resolveEventBannerUrl(
  event: EventBannerSource,
  galleryImages: GalleryImageRow[] = [],
): string | null {
  const url = event.banner_image_url?.trim();
  if (url) return url;

  if (event.cover_gallery_image_id) {
    return galleryImages.find((image) => image.id === event.cover_gallery_image_id)?.publicUrl ?? null;
  }

  return null;
}

export function resolveGalleryStorageUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  return getGalleryPublicUrl(storagePath);
}
