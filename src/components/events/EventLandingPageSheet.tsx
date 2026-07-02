/**
 * Event Landing Page editor — marketing fields for bspcommunity.org/events/{slug}
 */

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Copy, ExternalLink, Globe, Loader2, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { GalleryImagePicker } from "@/components/gallery/GalleryImagePicker";
import {
  useUpdateNonprofitEvent,
  useEventTicketTypes,
  useUpsertEventTicketTypes,
  type NonprofitEvent,
} from "@/hooks/useNonprofitEvents";
import {
  DEFAULT_EVENT_HIGHLIGHTS,
  DEFAULT_EXPECTATIONS_HEADING,
  DEFAULT_PAYMENT_INSTRUCTIONS,
  eventLandingPublicUrl,
  type EventHighlight,
} from "@/lib/eventLandingDefaults";
import { slugifyEventTitle } from "@/lib/eventSlug";

const landingSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  tagline: z.string().optional(),
  expectations_heading: z.string().optional(),
  hero_cta_label: z.string().min(1, "CTA label is required"),
  event_end_time: z.string().optional(),
  payment_instructions: z.string().optional(),
  map_embed_url: z.union([z.literal(""), z.string().url("Enter a valid URL")]).optional(),
  is_public: z.boolean(),
  highlights: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      icon: z.string().optional(),
    }),
  ),
  ticketTypes: z.array(
    z.object({
      tier: z.string().min(1, "Tier name is required"),
      price: z.coerce.number().min(0, "Price must be 0 or more"),
    }),
  ),
});

type LandingForm = z.infer<typeof landingSchema>;

function parseHighlights(raw: unknown): EventHighlight[] {
  if (!Array.isArray(raw)) return DEFAULT_EVENT_HIGHLIGHTS;
  return raw
    .filter((item): item is EventHighlight => typeof item === "object" && item !== null && "title" in item)
    .map((item) => ({
      title: String((item as EventHighlight).title),
      icon: (item as EventHighlight).icon,
    }));
}

function timeToInputValue(time: string | null | undefined): string {
  if (!time) return "";
  const h24 = time.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) return `${h24[1].padStart(2, "0")}:${h24[2]}`;
  return time;
}

interface EventLandingPageSheetProps {
  event: NonprofitEvent | null;
  onClose: () => void;
  canEdit: boolean;
}

export function EventLandingPageSheet({ event, onClose, canEdit }: EventLandingPageSheetProps) {
  const updateEvent = useUpdateNonprofitEvent();
  const upsertTickets = useUpsertEventTicketTypes();
  const { data: existingTickets = [] } = useEventTicketTypes(event?.id ?? null);
  const [secondaryImageId, setSecondaryImageId] = useState<string | null>(null);

  const form = useForm<LandingForm>({
    resolver: zodResolver(landingSchema),
    defaultValues: {
      slug: "",
      tagline: "",
      expectations_heading: DEFAULT_EXPECTATIONS_HEADING,
      hero_cta_label: "Join Us",
      event_end_time: "",
      payment_instructions: DEFAULT_PAYMENT_INSTRUCTIONS,
      map_embed_url: "",
      is_public: false,
      highlights: DEFAULT_EVENT_HIGHLIGHTS,
      ticketTypes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "highlights",
  });

  const {
    fields: ticketFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({
    control: form.control,
    name: "ticketTypes",
  });

  useEffect(() => {
    if (!event) return;
    setSecondaryImageId(event.secondary_gallery_image_id ?? null);
    form.reset({
      slug: event.slug ?? slugifyEventTitle(event.title),
      tagline: event.tagline ?? "",
      expectations_heading: event.expectations_heading ?? DEFAULT_EXPECTATIONS_HEADING,
      hero_cta_label: event.hero_cta_label ?? "Join Us",
      event_end_time: timeToInputValue(event.event_end_time),
      payment_instructions: event.payment_instructions ?? DEFAULT_PAYMENT_INSTRUCTIONS,
      map_embed_url: event.map_embed_url ?? "",
      is_public: event.is_public ?? false,
      highlights: parseHighlights(event.highlights).length > 0
        ? parseHighlights(event.highlights)
        : DEFAULT_EVENT_HIGHLIGHTS,
      ticketTypes: existingTickets.map((t) => ({
        tier: t.tier,
        price: Number(t.price),
      })),
    });
  }, [event, existingTickets, form]);

  const copyPublicUrl = () => {
    const slug = form.watch("slug");
    if (!slug) return;
    navigator.clipboard.writeText(eventLandingPublicUrl(slug))
      .then(() => toast.success("Public URL copied"))
      .catch(() => toast.error("Failed to copy URL"));
  };

  const onSubmit = async (data: LandingForm) => {
    if (!event || !canEdit) return;

    await updateEvent.mutateAsync({
      id: event.id,
      data: {
        slug: data.slug,
        tagline: data.tagline?.trim() || null,
        expectations_heading: data.expectations_heading?.trim() || null,
        hero_cta_label: data.hero_cta_label,
        event_end_time: data.event_end_time?.trim() || null,
        payment_instructions: data.payment_instructions?.trim() || null,
        map_embed_url: data.map_embed_url?.trim() || null,
        is_public: data.is_public,
        highlights: data.highlights,
        secondary_gallery_image_id: secondaryImageId,
      },
    });

    await upsertTickets.mutateAsync({
      eventId: event.id,
      ticketTypes: data.ticketTypes,
    });

    onClose();
  };

  const isSaving = updateEvent.isPending || upsertTickets.isPending;
  const slug = form.watch("slug");
  const isPublic = form.watch("is_public");
  const previewUrl = slug ? eventLandingPublicUrl(slug) : null;

  return (
    <Sheet open={!!event} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        {event && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Landing Page
              </SheetTitle>
              <SheetDescription>
                Configure the public marketing page for {event.title}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label>Public URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={previewUrl ?? ""}
                    className="text-xs font-mono"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={copyPublicUrl} title="Copy URL">
                    <Copy className="h-4 w-4" />
                  </Button>
                  {previewUrl && (
                    <Button type="button" variant="outline" size="icon" asChild title="Open preview">
                      <a href={previewUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lp-slug">URL slug</Label>
                <Input id="lp-slug" {...form.register("slug")} disabled={!canEdit} />
                {form.formState.errors.slug && (
                  <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lp-tagline">Hero tagline</Label>
                <Input
                  id="lp-tagline"
                  placeholder="A PROFESSIONAL NETWORKING OPPORTUNITY"
                  {...form.register("tagline")}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lp-expectations">Expectations heading</Label>
                <Textarea
                  id="lp-expectations"
                  rows={2}
                  {...form.register("expectations_heading")}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lp-cta">Hero CTA label</Label>
                <Input id="lp-cta" {...form.register("hero_cta_label")} disabled={!canEdit} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lp-end-time">End time (optional)</Label>
                <Input id="lp-end-time" type="time" {...form.register("event_end_time")} disabled={!canEdit} />
                <p className="text-xs text-muted-foreground">Pairs with start time for the calendar section.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>What to Expect highlights</Label>
                  {canEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ title: "", icon: "star" })}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder="Highlight title"
                        {...form.register(`highlights.${index}.title`)}
                        disabled={!canEdit}
                      />
                      {canEdit && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lp-payment">Payment instructions</Label>
                <Textarea id="lp-payment" rows={3} {...form.register("payment_instructions")} disabled={!canEdit} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Registration fees</Label>
                  {canEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendTicket({ tier: "", price: 0 })}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add tier
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {ticketFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder="Individual"
                        {...form.register(`ticketTypes.${index}.tier`)}
                        disabled={!canEdit}
                      />
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="25"
                        className="w-24"
                        {...form.register(`ticketTypes.${index}.price`)}
                        disabled={!canEdit}
                      />
                      {canEdit && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTicket(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {ticketFields.length === 0 && (
                    <p className="text-xs text-muted-foreground">No fee tiers — add Individual / Family fees if applicable.</p>
                  )}
                </div>
              </div>

              {canEdit && (
                <GalleryImagePicker
                  value={secondaryImageId}
                  onChange={setSecondaryImageId}
                  label="Secondary image (What to Expect section)"
                />
              )}

              <div className="space-y-1.5">
                <Label htmlFor="lp-map">Map embed URL (optional)</Label>
                <Input
                  id="lp-map"
                  type="url"
                  placeholder="https://www.google.com/maps/embed?..."
                  {...form.register("map_embed_url")}
                  disabled={!canEdit}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border px-3 py-3">
                <div className="space-y-0.5">
                  <Label htmlFor="lp-public">Publish landing page</Label>
                  <p className="text-xs text-muted-foreground">
                    When enabled, the page is live at bspcommunity.org/events/{slug || "…"}
                  </p>
                </div>
                <Switch
                  id="lp-public"
                  checked={isPublic}
                  onCheckedChange={(checked) => form.setValue("is_public", checked)}
                  disabled={!canEdit}
                />
              </div>

              {canEdit && (
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                  ) : (
                    "Save Landing Page"
                  )}
                </Button>
              )}
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
