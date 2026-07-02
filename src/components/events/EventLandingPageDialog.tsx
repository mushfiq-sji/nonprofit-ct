import { useEffect, useState } from "react";
import { useForm, useFieldArray, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy, ExternalLink, Globe, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LayoutPickerGrid } from "@/components/events/EventLayoutPreview";
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
import {
  getEventPageLayout,
  type EventPageLayoutId,
} from "@/lib/eventPageLayouts";
import { slugifyEventTitle, buildEventSlug } from "@/lib/eventSlug";
import { hasEventLandingPage, clearEventLandingPageUpdate } from "@/lib/eventLandingStatus";
import { syncEventLandingPageRegistry } from "@/lib/eventLandingPageRegistry";
import { invalidateKeys } from "@/lib/cache";
import { useAuth } from "@/contexts/AuthContext";
import { EventPageDesignerPresence } from "@/components/events/EventPageDesignerPresence";

const optionalUrlField = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Enter a valid URL",
  });

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
  map_embed_url: optionalUrlField,
  banner_image_url: optionalUrlField,
  is_public: z.boolean(),
  highlights: z
    .array(
      z.object({
        title: z.string(),
        icon: z.string().optional(),
      }),
    )
    .transform((items) =>
      items
        .filter((item) => item.title.trim().length > 0)
        .map((item) => ({ title: item.title.trim(), icon: item.icon })),
    ),
  ticketTypes: z
    .array(
      z.object({
        tier: z.string(),
        price: z.preprocess(
          (value) => (value === "" || value === null || value === undefined ? 0 : value),
          z.coerce.number().min(0, "Price must be 0 or more"),
        ),
      }),
    )
    .transform((rows) => rows.filter((row) => row.tier.trim().length > 0)),
});

type LandingForm = z.infer<typeof landingSchema>;
type LandingStep = "layout" | "configure";

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

function parsePageLayout(raw: string | null | undefined): EventPageLayoutId {
  if (raw === "split" || raw === "minimal" || raw === "classic") return raw;
  return "classic";
}

function firstLandingFormError(errors: FieldErrors<LandingForm>): string {
  const directFields: (keyof LandingForm)[] = [
    "slug",
    "banner_image_url",
    "map_embed_url",
    "hero_cta_label",
    "highlights",
    "ticketTypes",
  ];
  for (const field of directFields) {
    const err = errors[field];
    if (err && typeof err === "object" && "message" in err && err.message) {
      return String(err.message);
    }
  }
  if (Array.isArray(errors.ticketTypes)) {
    for (const row of errors.ticketTypes) {
      if (row?.tier?.message) return String(row.tier.message);
      if (row?.price?.message) return String(row.price.message);
    }
  }
  if (Array.isArray(errors.highlights)) {
    for (const row of errors.highlights) {
      if (row?.title?.message) return String(row.title.message);
    }
  }
  return "Please fix the highlighted fields before saving.";
}

function landingSaveErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Failed to save landing page";
  if (/nonprofit_event_landing_pages|nonprofit_event_landing_page_activity/i.test(message)) {
    return "Event Page Designer tables are missing. Run supabase/migrations/20260702140000_event_landing_page_designer.sql in Lovable SQL Editor, then try again.";
  }
  if (/page_layout|banner_image_url|hero_cta_label|expectations_heading|map_embed_url/i.test(message)) {
    return "Landing page columns are missing in the database. Run supabase/migrations/20260702130000_event_page_layout_and_banner.sql in Lovable SQL Editor, then try again.";
  }
  if (/duplicate key|unique constraint|nonprofit_events_slug/i.test(message)) {
    return "That URL slug is already used by another event. Choose a different slug.";
  }
  return message;
}

interface EventLandingPageDialogProps {
  event: NonprofitEvent | null;
  onClose: () => void;
  canEdit: boolean;
}

export function EventLandingPageDialog({ event, onClose, canEdit }: EventLandingPageDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const updateEvent = useUpdateNonprofitEvent();
  const upsertTickets = useUpsertEventTicketTypes();
  const { data: existingTickets = [] } = useEventTicketTypes(event?.id ?? null);
  const [step, setStep] = useState<LandingStep>("layout");
  const [selectedLayout, setSelectedLayout] = useState<EventPageLayoutId>("classic");
  const [isApplyingLayout, setIsApplyingLayout] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      banner_image_url: "",
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
    const layoutId = parsePageLayout(event.page_layout);
    const landingConfigured = hasEventLandingPage(event);
    setSelectedLayout(layoutId);
    setStep(landingConfigured ? "configure" : "layout");
  }, [event]);

  useEffect(() => {
    if (!event) return;
    form.reset({
      slug: event.slug ?? buildEventSlug(event.title, event.id),
      tagline: event.tagline ?? "",
      expectations_heading: event.expectations_heading ?? DEFAULT_EXPECTATIONS_HEADING,
      hero_cta_label: event.hero_cta_label ?? "Join Us",
      event_end_time: timeToInputValue(event.event_end_time),
      payment_instructions: event.payment_instructions ?? DEFAULT_PAYMENT_INSTRUCTIONS,
      map_embed_url: event.map_embed_url ?? "",
      banner_image_url: event.banner_image_url ?? "",
      is_public: event.is_public ?? false,
      highlights: parseHighlights(event.highlights).length > 0
        ? parseHighlights(event.highlights)
        : DEFAULT_EVENT_HIGHLIGHTS,
      ticketTypes: existingTickets.map((t) => ({
        tier: t.tier,
        price: Number(t.price),
      })),
    });
  }, [event?.id, existingTickets.length, form, event, existingTickets]);

  const landingConfigured = event ? hasEventLandingPage(event) : false;

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const applyLayoutDefaults = (layoutId: EventPageLayoutId) => {
    const layout = getEventPageLayout(layoutId);
    setSelectedLayout(layoutId);
    setIsApplyingLayout(true);
    window.setTimeout(() => {
      form.setValue("expectations_heading", layout.expectations_heading);
      form.setValue("hero_cta_label", layout.hero_cta_label);
      form.setValue("highlights", layout.highlights);
      setIsApplyingLayout(false);
      setStep("configure");
    }, 800);
  };

  const copyPublicUrl = () => {
    const slug = form.watch("slug");
    if (!slug) return;
    navigator.clipboard.writeText(eventLandingPublicUrl(slug))
      .then(() => toast.success("Public URL copied"))
      .catch(() => toast.error("Failed to copy URL"));
  };

  const onSubmit = async (data: LandingForm) => {
    if (!event || !canEdit) return;

    try {
      await updateEvent.mutateAsync({
        id: event.id,
        data: {
          slug: data.slug.trim(),
          page_layout: selectedLayout,
          tagline: data.tagline?.trim() || null,
          expectations_heading: data.expectations_heading?.trim() || null,
          hero_cta_label: data.hero_cta_label,
          event_end_time: data.event_end_time?.trim() || null,
          payment_instructions: data.payment_instructions?.trim() || null,
          map_embed_url: data.map_embed_url?.trim() || null,
          banner_image_url: data.banner_image_url?.trim() || null,
          is_public: data.is_public,
          highlights: data.highlights,
        },
      });

      await upsertTickets.mutateAsync({
        eventId: event.id,
        ticketTypes: data.ticketTypes,
      });

      await syncEventLandingPageRegistry({
        eventId: event.id,
        eventTitle: event.title,
        slug: data.slug.trim(),
        pageLayout: selectedLayout,
        isPublished: data.is_public,
        wasConfigured: landingConfigured,
        previousIsPublished: event.is_public ?? false,
        userId: user?.id ?? null,
      });
      invalidateKeys.nonprofitEventLandingPages(queryClient);

      toast.success("Event Page Designer saved your landing page");
      onClose();
    } catch (error) {
      toast.error(landingSaveErrorMessage(error));
    }
  };

  const onInvalid = (errors: FieldErrors<LandingForm>) => {
    toast.error(firstLandingFormError(errors));
  };

  const handleDeleteLandingPage = async () => {
    if (!event || !canEdit) return;

    setIsDeleting(true);
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        data: clearEventLandingPageUpdate(),
      });
      await upsertTickets.mutateAsync({
        eventId: event.id,
        ticketTypes: [],
      });
      await syncEventLandingPageRegistry({
        eventId: event.id,
        eventTitle: event.title,
        slug: null,
        pageLayout: parsePageLayout(event.page_layout),
        isPublished: false,
        wasConfigured: true,
        previousIsPublished: event.is_public ?? false,
        isDelete: true,
        userId: user?.id ?? null,
      });
      invalidateKeys.nonprofitEventLandingPages(queryClient);
      toast.success("Landing page removed. You can create a new one anytime.");
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      toast.error("Failed to delete landing page");
    } finally {
      setIsDeleting(false);
    }
  };

  const isSaving = updateEvent.isPending || upsertTickets.isPending;
  const isBusy = isSaving || isDeleting || isApplyingLayout;
  const slug = form.watch("slug");
  const isPublic = form.watch("is_public");
  const previewUrl = slug ? eventLandingPublicUrl(slug) : null;
  const layoutLabel = getEventPageLayout(selectedLayout).label;

  return (
    <Dialog open={!!event} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {event && step === "layout" && !landingConfigured && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Event Landing Page
              </DialogTitle>
              <DialogDescription>
                Choose a layout for <strong>{event.title}</strong>, then configure your page content.
              </DialogDescription>
            </DialogHeader>
            <EventPageDesignerPresence
              status="Your Event Page Designer will structure the full public page from the template you choose."
            />
            <LayoutPickerGrid
              selectedLayout={selectedLayout}
              onSelectLayout={applyLayoutDefaults}
            />
            {isApplyingLayout && (
              <EventPageDesignerPresence
                isBusy
                status={`Event Page Designer is applying the ${getEventPageLayout(selectedLayout).label} template…`}
              />
            )}
            {canEdit && (
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => setStep("configure")} disabled={isApplyingLayout}>
                  Continue with {layoutLabel}
                </Button>
              </div>
            )}
          </>
        )}

        {event && step === "configure" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                {canEdit && !landingConfigured && (
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => setStep("layout")}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Layout
                  </Button>
                )}
                <div className="flex-1">
                  <DialogTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Landing Page Settings
                  </DialogTitle>
                  <DialogDescription>{event.title}</DialogDescription>
                </div>
                <Badge variant="secondary">{layoutLabel}</Badge>
              </div>
            </DialogHeader>

            <EventPageDesignerPresence
              status={
                isDeleting
                  ? "Removing your landing page…"
                  : isSaving
                    ? "Event Page Designer is publishing your landing page…"
                    : "Event Page Designer is assisting with layout, copy, and registration settings."
              }
              isBusy={isBusy}
            />

            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label>Public URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value={previewUrl ?? ""} className="text-xs font-mono" />
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
                <Label htmlFor="lp-banner">Banner Image URL</Label>
                <Input
                  id="lp-banner"
                  type="text"
                  placeholder="https://example.com/banner.jpg"
                  {...form.register("banner_image_url")}
                  disabled={!canEdit}
                />
                {form.formState.errors.banner_image_url && (
                  <p className="text-xs text-destructive">{form.formState.errors.banner_image_url.message}</p>
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
                {form.formState.errors.hero_cta_label && (
                  <p className="text-xs text-destructive">{form.formState.errors.hero_cta_label.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lp-end-time">End time (optional)</Label>
                <Input id="lp-end-time" type="time" {...form.register("event_end_time")} disabled={!canEdit} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>What to Expect highlights</Label>
                  {canEdit && (
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ title: "", icon: "star" })}>
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
                    <Button type="button" variant="outline" size="sm" onClick={() => appendTicket({ tier: "", price: 0 })}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add tier
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {ticketFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input placeholder="Individual" {...form.register(`ticketTypes.${index}.tier`)} disabled={!canEdit} />
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
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lp-map">Map embed URL (optional)</Label>
                <Input
                  id="lp-map"
                  type="text"
                  placeholder="https://www.google.com/maps/embed?..."
                  {...form.register("map_embed_url")}
                  disabled={!canEdit}
                />
                {form.formState.errors.map_embed_url && (
                  <p className="text-xs text-destructive">{form.formState.errors.map_embed_url.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border px-3 py-3">
                <div className="space-y-0.5">
                  <Label htmlFor="lp-public">Publish landing page</Label>
                  <p className="text-xs text-muted-foreground">
                    When enabled, the page is live at /events/{slug || "…"}
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
                <div className="flex flex-col gap-2 pt-1">
                  <Button type="submit" className="w-full" disabled={isBusy}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Event Page Designer is publishing…
                      </>
                    ) : (
                      "Save Landing Page"
                    )}
                  </Button>
                  {landingConfigured && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isBusy}
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Landing Page
                    </Button>
                  )}
                </div>
              )}
            </form>
          </>
        )}
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete landing page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unpublish the public page for <strong>{event?.title}</strong>, remove the URL
              slug, and clear all landing content (banner, copy, highlights, and registration tiers).
              The event itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteLandingPage();
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete landing page"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
