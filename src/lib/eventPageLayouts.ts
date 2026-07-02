import {
  DEFAULT_EVENT_HIGHLIGHTS,
  DEFAULT_EXPECTATIONS_HEADING,
  type EventHighlight,
} from "@/lib/eventLandingDefaults";

export type EventPageLayoutId = "classic" | "split" | "minimal";

export interface EventPageLayoutDefinition {
  id: EventPageLayoutId;
  label: string;
  description: string;
  expectations_heading: string;
  hero_cta_label: string;
  highlights: EventHighlight[];
}

export const EVENT_PAGE_LAYOUTS: EventPageLayoutDefinition[] = [
  {
    id: "classic",
    label: "Classic Hero",
    description: "Split hero with title on the left and a large banner on the right.",
    expectations_heading: DEFAULT_EXPECTATIONS_HEADING,
    hero_cta_label: "Join Us",
    highlights: DEFAULT_EVENT_HIGHLIGHTS,
  },
  {
    id: "split",
    label: "Full-Width Banner",
    description: "Immersive top banner with centered event details below.",
    expectations_heading: "Experience an unforgettable community gathering built around connection and impact.",
    hero_cta_label: "Reserve Your Spot",
    highlights: [
      { title: "Featured keynote and community speakers", icon: "users" },
      { title: "Interactive sessions and live demos", icon: "trophy" },
      { title: "Networking with peers and partners", icon: "heart" },
    ],
  },
  {
    id: "minimal",
    label: "Minimal Focus",
    description: "Clean, centered layout that puts the event title and CTA first.",
    expectations_heading: "Everything you need to know — date, location, and registration in one focused page.",
    hero_cta_label: "Register Now",
    highlights: [
      { title: "Clear schedule and location details", icon: "mountain" },
      { title: "Simple registration flow", icon: "users" },
      { title: "Mobile-friendly reading experience", icon: "heart" },
    ],
  },
];

export function getEventPageLayout(id: EventPageLayoutId): EventPageLayoutDefinition {
  return EVENT_PAGE_LAYOUTS.find((layout) => layout.id === id) ?? EVENT_PAGE_LAYOUTS[0];
}
