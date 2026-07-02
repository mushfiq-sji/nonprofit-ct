/**
 * Pick a cover image from the nonprofit gallery (admin/moderator event forms).
 */

import { useMemo, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  GALLERY_CATEGORIES,
  type GalleryCategoryFilter,
  useGalleryImages,
  getGalleryPublicUrl,
} from "@/hooks/useGalleryImages";

interface GalleryImagePickerProps {
  value: string | null;
  onChange: (imageId: string | null) => void;
  label?: string;
  disabled?: boolean;
}

export function GalleryImagePicker({
  value,
  onChange,
  label = "Cover image",
  disabled = false,
}: GalleryImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<GalleryCategoryFilter>("All");
  const { data: allImages = [] } = useGalleryImages();
  const { data: images = [], isLoading } = useGalleryImages(
    open ? { category } : { category: "All" },
  );

  const selectedImage = useMemo(
    () => allImages.find((image) => image.id === value) ?? null,
    [allImages, value],
  );

  const previewUrl = selectedImage?.publicUrl ?? null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "relative h-24 w-36 shrink-0 overflow-hidden rounded-lg border bg-muted",
            !previewUrl && "grid place-items-center text-muted-foreground",
          )}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 opacity-50" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            Choose from gallery
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start px-2 text-muted-foreground"
              disabled={disabled}
              onClick={() => onChange(null)}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Remove image
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select gallery image</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <Select
              value={category}
              onValueChange={(next) => setCategory(next as GalleryCategoryFilter)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All categories</SelectItem>
                {GALLERY_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : images.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No gallery images yet. Upload images from the Gallery module first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image) => {
                  const isSelected = value === image.id;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      className={cn(
                        "group overflow-hidden rounded-lg border text-left transition-all",
                        isSelected
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "hover:border-primary/50",
                      )}
                      onClick={() => {
                        onChange(image.id);
                        setOpen(false);
                      }}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={image.publicUrl}
                          alt={image.title ?? image.file_name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-0.5 p-2">
                        <p className="truncate text-xs font-medium">
                          {image.title ?? image.file_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{image.category}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function resolveEventCoverUrl(
  coverGalleryImageId: string | null | undefined,
  images: Array<{ id: string; publicUrl: string }>,
  storagePath?: string | null,
): string | null {
  if (storagePath) return getGalleryPublicUrl(storagePath);
  if (!coverGalleryImageId) return null;
  return images.find((image) => image.id === coverGalleryImageId)?.publicUrl ?? null;
}
