export interface EventLandingHighlight {
  title: string;
  icon?: string;
}

export interface EventLandingTicketType {
  tier: string;
  price: number;
}

export interface EventLandingView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  end_time: string | null;
  location: string | null;
  cover_image_url: string | null;
  secondary_image_url: string | null;
  page_layout: "classic" | "split" | "minimal";
  status: "upcoming" | "active" | "past";
  registration_url: string | null;
  tagline: string | null;
  highlights: EventLandingHighlight[];
  payment_instructions: string | null;
  map_embed_url: string | null;
  hero_cta_label: string;
  expectations_heading: string | null;
  ticket_types: EventLandingTicketType[];
}
