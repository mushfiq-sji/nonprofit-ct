import { ORG_BRANDING } from "@/shared/config/branding";

export interface EventHighlight {
  title: string;
  icon?: string;
}

export const DEFAULT_EVENT_HIGHLIGHTS: EventHighlight[] = [
  { title: "Great Networking Opportunity", icon: "users" },
  { title: "Enjoy Delicious Food", icon: "utensils" },
  { title: "Fun Games & Activities for All Ages", icon: "trophy" },
  { title: "Relaxing Time Outdoors", icon: "mountain" },
  { title: "Wonderful Company Atmosphere", icon: "heart" },
];

export const DEFAULT_PAYMENT_INSTRUCTIONS =
  `Secure your spot today by sending your payment via Zelle to: ${ORG_BRANDING.contact.email}`;

export const DEFAULT_EXPECTATIONS_HEADING =
  "Join your fellow Bangladeshi professionals for a day of sunshine, laughter, & good times!";

export const BSP_PUBLIC_SITE_URL = "https://bspcommunity.org";

export function eventLandingPublicUrl(slug: string): string {
  const configured = import.meta.env.VITE_BSP_PUBLIC_SITE_URL as string | undefined;
  const base =
    configured?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : BSP_PUBLIC_SITE_URL);
  return `${base}/events/${slug}`;
}
