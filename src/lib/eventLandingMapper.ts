import type { EventHighlight } from "@/lib/eventLandingDefaults";
import type { EventLandingView } from "@/types/eventLanding";
import type { EventTicketType, NonprofitEvent } from "@/hooks/useNonprofitEvents";
import { getGalleryPublicUrl } from "@/hooks/useGalleryImages";

function formatEventTime(time: string | null | undefined): string | null {
  if (!time) return null;
  const h24 = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!h24) return time;
  const hours = parseInt(h24[1], 10);
  const minutes = h24[2];
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${period}`;
}

function mapStatus(status: string): EventLandingView["status"] {
  if (status === "Past") return "past";
  if (status === "Active") return "active";
  return "upcoming";
}

function parseHighlights(raw: unknown): EventHighlight[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is EventHighlight =>
      typeof item === "object" && item !== null && "title" in item
    )
    .map((item) => ({
      title: String(item.title),
      icon: item.icon,
    }));
}

export function mapEventToLandingView(
  event: NonprofitEvent,
  ticketTypes: EventTicketType[],
  galleryPaths: Record<string, string>,
): EventLandingView {
  return {
    id: event.id,
    slug: event.slug ?? event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    time: formatEventTime(event.event_time),
    end_time: formatEventTime(event.event_end_time),
    location: event.location,
    cover_image_url: event.cover_gallery_image_id
      ? galleryPaths[event.cover_gallery_image_id] ?? null
      : null,
    secondary_image_url: event.secondary_gallery_image_id
      ? galleryPaths[event.secondary_gallery_image_id] ?? null
      : null,
    status: mapStatus(event.status),
    registration_url: event.registration_url,
    tagline: event.tagline,
    highlights: parseHighlights(event.highlights),
    payment_instructions: event.payment_instructions,
    map_embed_url: event.map_embed_url,
    hero_cta_label: event.hero_cta_label ?? "Join Us",
    expectations_heading: event.expectations_heading,
    ticket_types: ticketTypes.map((t) => ({
      tier: t.tier,
      price: Number(t.price),
    })),
  };
}

export function galleryPathsFromRows(
  rows: Array<{ id: string; storage_path: string }>,
): Record<string, string> {
  const paths: Record<string, string> = {};
  for (const row of rows) {
    paths[row.id] = getGalleryPublicUrl(row.storage_path);
  }
  return paths;
}
