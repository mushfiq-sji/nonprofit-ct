import { supabase } from "@/integrations/supabase/client";
import { getEventPageLayout, type EventPageLayoutId } from "@/lib/eventPageLayouts";

export type EventLandingPageAction = "configured" | "updated" | "published" | "unpublished" | "deleted";

export interface SyncEventLandingPageInput {
  eventId: string;
  eventTitle: string;
  slug: string | null;
  pageLayout: EventPageLayoutId;
  isPublished: boolean;
  wasConfigured: boolean;
  previousIsPublished: boolean;
  isDelete?: boolean;
  userId?: string | null;
}

function layoutLabel(layout: EventPageLayoutId): string {
  return getEventPageLayout(layout).label;
}

function resolveAction(input: SyncEventLandingPageInput): EventLandingPageAction {
  if (input.isDelete) return "deleted";
  if (!input.wasConfigured) return "configured";
  if (input.isPublished && !input.previousIsPublished) return "published";
  if (!input.isPublished && input.previousIsPublished) return "unpublished";
  return "updated";
}

function buildActivitySummary(input: SyncEventLandingPageInput, action: EventLandingPageAction): string {
  const label = layoutLabel(input.pageLayout);

  switch (action) {
    case "deleted":
      return `Removed landing page for ${input.eventTitle}`;
    case "published":
      return `Published ${input.eventTitle} — ${label} layout`;
    case "unpublished":
      return `Unpublished ${input.eventTitle} — ${label} layout (draft)`;
    case "configured":
      return `Landing page configured for ${input.eventTitle} — ${label} (draft)`;
    case "updated":
    default:
      return `Updated landing page for ${input.eventTitle} — ${label}`;
  }
}

/** Upserts registry row and appends an activity log entry after landing save/delete. */
export async function syncEventLandingPageRegistry(input: SyncEventLandingPageInput): Promise<void> {
  const action = resolveAction(input);
  const summary = buildActivitySummary(input, action);
  const createdBy = input.userId ?? null;

  if (input.isDelete) {
    const { data: existing } = await supabase
      .from("nonprofit_event_landing_pages")
      .select("id")
      .eq("event_id", input.eventId)
      .maybeSingle();

    if (existing?.id) {
      const { error: activityError } = await supabase.from("nonprofit_event_landing_page_activity").insert({
        event_id: input.eventId,
        landing_page_id: existing.id,
        action,
        event_title: input.eventTitle,
        page_layout: input.pageLayout,
        summary,
        created_by: createdBy,
      });
      if (activityError) throw activityError;
    }

    const { error: deleteError } = await supabase
      .from("nonprofit_event_landing_pages")
      .delete()
      .eq("event_id", input.eventId);
    if (deleteError) throw deleteError;
    return;
  }

  const { data: landingPage, error: upsertError } = await supabase
    .from("nonprofit_event_landing_pages")
    .upsert(
      {
        event_id: input.eventId,
        event_title: input.eventTitle,
        slug: input.slug,
        page_layout: input.pageLayout,
        is_published: input.isPublished,
        created_by: createdBy,
      },
      { onConflict: "event_id" },
    )
    .select("id")
    .single();

  if (upsertError) throw upsertError;

  const { error: activityError } = await supabase.from("nonprofit_event_landing_page_activity").insert({
    event_id: input.eventId,
    landing_page_id: landingPage.id,
    action,
    event_title: input.eventTitle,
    page_layout: input.pageLayout,
    summary,
    created_by: createdBy,
  });
  if (activityError) throw activityError;
}
