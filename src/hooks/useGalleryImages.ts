/**
 * useGalleryImages — Public nonprofit gallery image hooks.
 * Stores relative paths in DB and renders public URLs from the gallery-images bucket.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, invalidateKeys } from "@/lib/cache";
import { sanitizeFilename } from "@/lib/sanitize";
import { useToast } from "@/hooks/use-toast";
import { logCrud } from "@/lib/activity-logger";
import type { Database } from "@/integrations/supabase/types";

const GALLERY_BUCKET = "gallery-images";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export const GALLERY_CATEGORIES = [
  "Personal Finance",
  "Technology",
  "Community",
  "Sports",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];
export type GalleryCategoryFilter = GalleryCategory | "All";
export type GalleryImage = Database["public"]["Tables"]["nonprofit_gallery_images"]["Row"];
export type GalleryImageInsert = Database["public"]["Tables"]["nonprofit_gallery_images"]["Insert"];

export interface GalleryImageWithUrl extends GalleryImage {
  publicUrl: string;
}

export interface GalleryImageFilters {
  category?: GalleryCategoryFilter;
  [key: string]: unknown;
}

export interface UploadGalleryImageInput {
  file: File;
  title?: string;
  caption?: string;
  category: GalleryCategory;
}

function getGalleryPublicUrl(storagePath: string): string {
  return supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export { getGalleryPublicUrl };

function assertValidImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Please upload a PNG, JPG, WEBP, or GIF image.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }
}

export function useGalleryImages(filters?: GalleryImageFilters) {
  return useQuery({
    queryKey: queryKeys.nonprofit.gallery.list(filters),
    queryFn: async (): Promise<GalleryImageWithUrl[]> => {
      let query = supabase
        .from("nonprofit_gallery_images")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (filters?.category && filters.category !== "All") {
        query = query.eq("category", filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return ((data ?? []) as GalleryImage[]).map((image) => ({
        ...image,
        publicUrl: getGalleryPublicUrl(image.storage_path),
      }));
    },
  });
}

export function useUploadGalleryImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: UploadGalleryImageInput): Promise<GalleryImage> => {
      assertValidImage(input.file);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("You must be signed in to upload gallery images.");

      const safeName = sanitizeFilename(input.file.name);
      const storagePath = `gallery/${crypto.randomUUID()}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(GALLERY_BUCKET)
        .upload(storagePath, input.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const payload: GalleryImageInsert = {
        uploaded_by: user.id,
        title: input.title?.trim() || null,
        caption: input.caption?.trim() || null,
        category: input.category,
        storage_path: storagePath,
        file_name: input.file.name,
        file_type: input.file.type,
        file_size: input.file.size,
      };

      const { data, error } = await supabase
        .from("nonprofit_gallery_images")
        .insert([payload])
        .select()
        .single();

      if (error) {
        await supabase.storage.from(GALLERY_BUCKET).remove([storagePath]);
        throw error;
      }

      return data as GalleryImage;
    },
    onSuccess: (image) => {
      invalidateKeys.nonprofitGallery(queryClient);
      logCrud("create", "nonprofit_gallery_image", image.id, {
        category: image.category,
        file_name: image.file_name,
      });
      toast({
        title: "Image uploaded",
        description: "The gallery image is now available publicly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Image not uploaded",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (image: GalleryImage): Promise<string> => {
      const { error: storageError } = await supabase.storage
        .from(GALLERY_BUCKET)
        .remove([image.storage_path]);

      if (storageError) throw storageError;

      const { error } = await supabase
        .from("nonprofit_gallery_images")
        .delete()
        .eq("id", image.id);

      if (error) throw error;
      return image.id;
    },
    onSuccess: (imageId) => {
      invalidateKeys.nonprofitGallery(queryClient);
      logCrud("delete", "nonprofit_gallery_image", imageId);
      toast({
        title: "Image deleted",
        description: "The gallery image has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Image not deleted",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
