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

const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  users: Users,
  utensils: Utensils,
  trophy: Trophy,
  mountain: Mountain,
  heart: Heart,
};

function highlightIcon(icon?: string): LucideIcon {
  if (icon && HIGHLIGHT_ICONS[icon]) return HIGHLIGHT_ICONS[icon];
  return Users;
}

function formatDateLong(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(start: string | null, end: string | null) {
  if (start && end) return `From ${start} To ${end}`;
  if (start) return start;
  return null;
}

function scrollToRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
}

function BspLogo({ variant = "light" }: { variant?: "light" | "dark" }) {
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

interface EventLandingPageProps {
  event: EventLandingView;
}

export function EventLandingPage({ event }: EventLandingPageProps) {
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

  return (
    <div className="bg-white min-h-screen">
      <section className="relative bg-[#1B2D4F] text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center mb-8">
            <BspLogo variant="light" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pb-16 pt-4">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                {event.title}
              </h1>
              {event.tagline && (
                <p className="mt-4 text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-white/80">
                  {event.tagline}
                </p>
              )}
              {!isPast && (
                <button
                  type="button"
                  onClick={scrollToRegister}
                  className="mt-8 inline-flex items-center justify-center rounded-full border-2 border-white px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-white hover:text-[#1B2D4F] transition-colors"
                >
                  {event.hero_cta_label}
                </button>
              )}
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
              {event.cover_image_url ? (
                <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[#4A7BA7]/40" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-[#1B2D4F] max-w-4xl mx-auto leading-snug">
            {expectationsHeading}
          </h2>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted shadow-md">
              {event.secondary_image_url ? (
                <img src={event.secondary_image_url} alt="" className="h-full w-full object-cover" />
              ) : event.cover_image_url ? (
                <img src={event.cover_image_url} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1B2D4F] mb-6">What to Expect:</h3>
              <ul className="space-y-4">
                {highlights.map((item) => {
                  const Icon = highlightIcon(item.icon);
                  return (
                    <li key={item.title} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F4FC] text-[#4A7BA7]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-base text-[#1B2D4F] font-medium pt-1.5">{item.title}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#E8F4FC] py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2D4F]">Mark Your Calendar!</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 px-6 py-5">
              <Calendar className="h-8 w-8 text-[#4A7BA7]" />
              <span className="font-semibold text-[#1B2D4F]">{formatDateLong(event.date)}</span>
            </div>
            {timeRange && (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 px-6 py-5">
                <Clock className="h-8 w-8 text-[#4A7BA7]" />
                <span className="font-semibold text-[#1B2D4F]">{timeRange}</span>
              </div>
            )}
          </div>
          {event.ticket_types.length > 0 && (
            <div className="mt-12 max-w-lg mx-auto border-t border-b border-[#1B2D4F]/20 py-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-[#4A7BA7]" />
                <h3 className="text-lg font-bold text-[#1B2D4F]">Registration Fees:</h3>
              </div>
              <div className="space-y-2 text-[#1B2D4F]">
                {event.ticket_types.map((tier) => (
                  <p key={tier.tier} className="font-medium">
                    {tier.tier}: ${tier.price.toLocaleString()}
                  </p>
                ))}
              </div>
            </div>
          )}
          {event.payment_instructions && (
            <div className="mt-8 max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-[#4A7BA7]" />
                <h3 className="text-lg font-bold text-[#1B2D4F]">Payment Options:</h3>
              </div>
              <p className="text-[#1B2D4F]/90 leading-relaxed whitespace-pre-line">
                {event.payment_instructions}
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="register" className="py-16 md:py-20 scroll-mt-24">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2D4F]">Reserve Your Spot!</h2>
          <p className="mt-4 text-muted-foreground">
            {event.description ?? "Register today to secure your place at this BSP community event."}
          </p>
          <div className="mt-8 rounded-2xl border bg-[#FAF8F5] p-8 shadow-sm">
            {isPast ? (
              <p className="text-sm font-medium text-muted-foreground">
                This event has passed. Thank you to everyone who joined us!
              </p>
            ) : event.registration_url ? (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-full bg-[#1B2D4F] py-3.5 text-sm font-semibold text-white hover:bg-[#152340] transition-colors"
              >
                Register Now
              </a>
            ) : (
              <a
                href={contactHref}
                className="block w-full rounded-full bg-[#1B2D4F] py-3.5 text-sm font-semibold text-white hover:bg-[#152340] transition-colors"
              >
                Contact Us to Register
              </a>
            )}
          </div>
        </div>
      </section>

      {event.location && (
        <section className="py-16 border-t">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1B2D4F]">Event Location</h2>
              <p className="mt-4 text-lg text-[#1B2D4F] font-medium">{event.location}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-[#3AAFA9] hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted border shadow-sm">
              <iframe
                title="Event location map"
                src={
                  event.map_embed_url ??
                  `https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`
                }
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

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
    </div>
  );
}
