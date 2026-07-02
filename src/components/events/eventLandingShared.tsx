import {
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Globe,
  Heart,
  Mail,
  MapPin,
  Mountain,
  Phone,
  Trophy,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { ORG_BRANDING } from "@/shared/config/branding";
import type { EventLandingHighlight, EventLandingView } from "@/types/eventLanding";

export const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  users: Users,
  utensils: Utensils,
  trophy: Trophy,
  mountain: Mountain,
  heart: Heart,
};

export function highlightIcon(icon?: string): LucideIcon {
  if (icon && HIGHLIGHT_ICONS[icon]) return HIGHLIGHT_ICONS[icon];
  return Users;
}

export function formatDateLong(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeRange(start: string | null, end: string | null) {
  if (start && end) return `From ${start} To ${end}`;
  if (start) return start;
  return null;
}

export function scrollToRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
}

export function useLandingContent(event: EventLandingView) {
  const isPast = event.status === "past";
  const timeRange = formatTimeRange(event.time, event.end_time);
  const expectationsHeading =
    event.expectations_heading ??
    "Join your fellow Bangladeshi professionals for a day of sunshine, laughter, & good times!";
  const highlights: EventLandingHighlight[] =
    event.highlights.length > 0
      ? event.highlights
      : [
          { title: "Great Networking Opportunity", icon: "users" },
          { title: "Enjoy Delicious Food", icon: "utensils" },
          { title: "Fun Games & Activities for All Ages", icon: "trophy" },
        ];
  const contactHref = `mailto:${ORG_BRANDING.contact.email}`;

  return { isPast, timeRange, expectationsHeading, highlights, contactHref };
}

export function BspLogo({ variant = "light" }: { variant?: "light" | "dark" }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={ORG_BRANDING.logoUrl}
        alt={ORG_BRANDING.shortName}
        className="h-14 w-14 object-contain"
      />
      <div className="flex items-baseline font-bold text-2xl tracking-tight">
        <span className={variant === "light" ? "text-white" : "text-[#1B2D4F]"}>B</span>
        <span className="text-[#E8922A]">S</span>
        <span className="text-[#3AAFA9]">P</span>
      </div>
    </div>
  );
}

interface RegisterBlockProps {
  event: EventLandingView;
  isPast: boolean;
  contactHref: string;
  variant?: "classic" | "split" | "minimal";
}

export function RegisterBlock({ event, isPast, contactHref, variant = "classic" }: RegisterBlockProps) {
  const buttonClass =
    variant === "minimal"
      ? "block w-full rounded-lg bg-[#1B2D4F] py-3 text-sm font-semibold text-white hover:bg-[#152340] transition-colors"
      : "block w-full rounded-full bg-[#1B2D4F] py-3.5 text-sm font-semibold text-white hover:bg-[#152340] transition-colors";

  const content = isPast ? (
    <p className="text-sm font-medium text-muted-foreground">
      This event has passed. Thank you to everyone who joined us!
    </p>
  ) : event.registration_url ? (
    <a href={event.registration_url} target="_blank" rel="noreferrer" className={buttonClass}>
      Register Now
    </a>
  ) : (
    <a href={contactHref} className={buttonClass}>
      Contact Us to Register
    </a>
  );

  if (variant === "split") {
    return (
      <section id="register" className="py-16 md:py-20 scroll-mt-24 bg-[#FAF8F5]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2D4F]">Reserve Your Spot!</h2>
            <p className="mt-4 text-[#1B2D4F]/80 leading-relaxed">
              {event.description ?? "Register today to secure your place at this BSP community event."}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-8 shadow-md">{content}</div>
        </div>
      </section>
    );
  }

  if (variant === "minimal") {
    return (
      <section id="register" className="py-12 scroll-mt-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="rounded-xl border-2 border-[#1B2D4F]/15 bg-white p-6">{content}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="register" className="py-16 md:py-20 scroll-mt-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2D4F]">Reserve Your Spot!</h2>
        <p className="mt-4 text-muted-foreground">
          {event.description ?? "Register today to secure your place at this BSP community event."}
        </p>
        <div className="mt-8 rounded-2xl border bg-[#FAF8F5] p-8 shadow-sm">{content}</div>
      </div>
    </section>
  );
}

export function ClassicFooter() {
  return (
    <section className="bg-[#1B2D4F] text-white py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-[#3AAFA9] mt-0.5" />
            <div>
              <div className="font-semibold text-white/90">Address</div>
              <div className="text-white/70 mt-1">{ORG_BRANDING.contact.location}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 shrink-0 text-[#3AAFA9] mt-0.5" />
            <div>
              <div className="font-semibold text-white/90">Phone</div>
              <a href={`tel:${ORG_BRANDING.contact.phone}`} className="text-white/70 mt-1 block hover:text-white">
                {ORG_BRANDING.contact.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 shrink-0 text-[#3AAFA9] mt-0.5" />
            <div>
              <div className="font-semibold text-white/90">Email</div>
              <a href={`mailto:${ORG_BRANDING.contact.email}`} className="text-white/70 mt-1 block hover:text-white break-all">
                {ORG_BRANDING.contact.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 shrink-0 text-[#3AAFA9] mt-0.5" />
            <div>
              <div className="font-semibold text-white/90">Website</div>
              <a href={ORG_BRANDING.websiteUrl} target="_blank" rel="noreferrer" className="text-white/70 mt-1 block hover:text-white">
                {ORG_BRANDING.websiteUrl.replace(/^https?:\/\//, "www.")}
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center gap-4">
          <BspLogo variant="light" />
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} All Rights Reserved To BSP Inc.
          </p>
        </div>
      </div>
    </section>
  );
}

export function SplitFooter() {
  return (
    <section className="bg-[#152340] text-white py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <BspLogo variant="light" />
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
          <a href={`mailto:${ORG_BRANDING.contact.email}`} className="hover:text-white flex items-center gap-1.5">
            <Mail className="h-4 w-4" /> Email
          </a>
          <a href={`tel:${ORG_BRANDING.contact.phone}`} className="hover:text-white flex items-center gap-1.5">
            <Phone className="h-4 w-4" /> Call
          </a>
          <a href={ORG_BRANDING.websiteUrl} target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1.5">
            <Globe className="h-4 w-4" /> Website
          </a>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} BSP Inc.</p>
      </div>
    </section>
  );
}

export function MinimalFooter() {
  return (
    <section className="border-t bg-[#FAF8F5] py-8">
      <div className="mx-auto max-w-3xl px-4 flex flex-col items-center gap-3">
        <BspLogo variant="dark" />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} All Rights Reserved To BSP Inc.
        </p>
      </div>
    </section>
  );
}

export { Calendar, Clock, CreditCard, DollarSign, MapPin };
