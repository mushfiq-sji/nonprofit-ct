import type { NonprofitEvent, NonprofitEventUpdate } from "@/hooks/useNonprofitEvents";

/** True after the user has saved landing page settings at least once. */
export function hasEventLandingPage(
  event: Pick<
    NonprofitEvent,
    | "expectations_heading"
    | "banner_image_url"
    | "tagline"
    | "payment_instructions"
    | "is_public"
    | "highlights"
  >,
): boolean {
  if (event.is_public) return true;
  if (event.banner_image_url?.trim()) return true;
  if (event.tagline?.trim()) return true;
  if (event.payment_instructions?.trim()) return true;
  if (event.expectations_heading?.trim()) return true;
  if (Array.isArray(event.highlights) && event.highlights.length > 0) return true;
  return false;
}

/** Resets all landing-page-specific fields so the layout picker flow starts fresh. */
export function clearEventLandingPageUpdate(): NonprofitEventUpdate {
  return {
    is_public: false,
    slug: null,
    tagline: null,
    expectations_heading: null,
    banner_image_url: null,
    payment_instructions: null,
    map_embed_url: null,
    highlights: [],
    page_layout: "classic",
    hero_cta_label: "Join Us",
  };
}
