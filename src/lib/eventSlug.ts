/** Generate a URL-safe slug from an event title. */
export function slugifyEventTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Unique slug for new events: title slug + short id suffix. */
export function buildEventSlug(title: string, eventId?: string): string {
  const base = slugifyEventTitle(title) || "event";
  if (!eventId) return base;
  const suffix = eventId.replace(/-/g, "").slice(0, 8);
  return `${base}-${suffix}`;
}
