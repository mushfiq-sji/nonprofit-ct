import {
  BspLogo,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  ClassicFooter,
  SplitFooter,
  MinimalFooter,
  RegisterBlock,
  formatDateLong,
  highlightIcon,
  scrollToRegister,
  useLandingContent,
} from "@/components/events/eventLandingShared";
import type { EventLandingView } from "@/types/eventLanding";

function HeroCtaButton({ label, isPast }: { label: string; isPast: boolean }) {
  if (isPast) return null;
  return (
    <button
      type="button"
      onClick={scrollToRegister}
      className="mt-8 inline-flex items-center justify-center rounded-full border-2 border-white px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-white hover:text-[#1B2D4F] transition-colors"
    >
      {label}
    </button>
  );
}

function ClassicLandingPage({ event }: { event: EventLandingView }) {
  const { isPast, timeRange, expectationsHeading, highlights, contactHref } = useLandingContent(event);

  return (
    <div className="bg-white min-h-screen">
      <section className="relative bg-[#1B2D4F] text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center mb-8">
            <BspLogo variant="light" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pb-16 pt-4">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">{event.title}</h1>
              {event.tagline && (
                <p className="mt-4 text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-white/80">
                  {event.tagline}
                </p>
              )}
              <HeroCtaButton label={event.hero_cta_label} isPast={isPast} />
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
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-[#1B2D4F] mb-6 text-center lg:text-left">What to Expect:</h3>
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
              <p className="text-[#1B2D4F]/90 leading-relaxed whitespace-pre-line">{event.payment_instructions}</p>
            </div>
          )}
        </div>
      </section>

      <RegisterBlock event={event} isPast={isPast} contactHref={contactHref} variant="classic" />

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

      <ClassicFooter />
    </div>
  );
}

function SplitLandingPage({ event }: { event: EventLandingView }) {
  const { isPast, timeRange, expectationsHeading, highlights, contactHref } = useLandingContent(event);

  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden bg-white">
        <div className="relative h-56 sm:h-72 md:h-96">
          {event.cover_image_url ? (
            <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1B2D4F] to-[#4A7BA7]" />
          )}
          <div className="absolute inset-0 bg-[#1B2D4F]/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
            <BspLogo variant="light" />
            <h1 className="mt-6 text-3xl md:text-5xl font-extrabold max-w-4xl">{event.title}</h1>
            {event.tagline && (
              <p className="mt-3 text-sm uppercase tracking-[0.18em] text-white/85">{event.tagline}</p>
            )}
            <HeroCtaButton label={event.hero_cta_label} isPast={isPast} />
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-[#1B2D4F] max-w-3xl mx-auto">
            {expectationsHeading}
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {highlights.map((item) => {
              const Icon = highlightIcon(item.icon);
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#1B2D4F]/10 bg-[#FAF8F5] p-6 text-center shadow-sm"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1B2D4F] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-[#1B2D4F] leading-snug">{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#1B2D4F] text-white py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-extrabold mb-10">Event Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg bg-white/10 px-5 py-4 text-center">
              <Calendar className="h-6 w-6 mx-auto text-[#3AAFA9]" />
              <p className="mt-2 text-xs uppercase tracking-wider text-white/60">Date</p>
              <p className="mt-1 text-sm font-semibold">{formatDateLong(event.date)}</p>
            </div>
            {timeRange && (
              <div className="rounded-lg bg-white/10 px-5 py-4 text-center">
                <Clock className="h-6 w-6 mx-auto text-[#3AAFA9]" />
                <p className="mt-2 text-xs uppercase tracking-wider text-white/60">Time</p>
                <p className="mt-1 text-sm font-semibold">{timeRange}</p>
              </div>
            )}
            {event.ticket_types.slice(0, 2).map((tier) => (
              <div key={tier.tier} className="rounded-lg bg-white/10 px-5 py-4 text-center">
                <DollarSign className="h-6 w-6 mx-auto text-[#3AAFA9]" />
                <p className="mt-2 text-xs uppercase tracking-wider text-white/60">{tier.tier}</p>
                <p className="mt-1 text-sm font-semibold">${tier.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
          {event.payment_instructions && (
            <p className="mt-8 text-center text-sm text-white/80 max-w-2xl mx-auto whitespace-pre-line">
              {event.payment_instructions}
            </p>
          )}
        </div>
      </section>

      <RegisterBlock event={event} isPast={isPast} contactHref={contactHref} variant="split" />

      {event.location && (
        <section className="py-0">
          <div className="aspect-[21/9] w-full overflow-hidden bg-muted">
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
          <div className="mx-auto max-w-4xl px-4 py-8 text-center">
            <h2 className="text-xl font-bold text-[#1B2D4F]">Event Location</h2>
            <p className="mt-2 text-[#1B2D4F]/90">{event.location}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-[#3AAFA9] hover:underline"
            >
              Open in Google Maps →
            </a>
          </div>
        </section>
      )}

      <SplitFooter />
    </div>
  );
}

function MinimalLandingPage({ event }: { event: EventLandingView }) {
  const { isPast, timeRange, expectationsHeading, highlights, contactHref } = useLandingContent(event);

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <section className="border-b bg-[#FAF8F5]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <BspLogo variant="dark" />
          {event.cover_image_url && (
            <div className="mt-6 aspect-[21/9] overflow-hidden rounded-xl border shadow-sm">
              <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover" />
            </div>
          )}
          <h1 className="mt-8 text-3xl md:text-4xl font-extrabold text-[#1B2D4F]">{event.title}</h1>
          {event.tagline && (
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-[#4A7BA7]">{event.tagline}</p>
          )}
          {!isPast && (
            <button
              type="button"
              onClick={scrollToRegister}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1B2D4F] px-8 py-3 text-sm font-semibold text-white hover:bg-[#152340] transition-colors"
            >
              {event.hero_cta_label}
            </button>
          )}
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <h2 className="text-lg font-bold text-[#1B2D4F] text-center leading-snug">{expectationsHeading}</h2>
          <ul className="mt-8 space-y-3">
            {highlights.map((item, index) => {
              const Icon = highlightIcon(item.icon);
              return (
                <li
                  key={item.title}
                  className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F4FC] text-[#4A7BA7] text-xs font-bold">
                    {index + 1}
                  </span>
                  <Icon className="h-4 w-4 text-[#4A7BA7] shrink-0" />
                  <span className="text-sm font-medium text-[#1B2D4F]">{item.title}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-y bg-white py-8">
        <div className="mx-auto max-w-lg px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-center gap-3 text-sm text-[#1B2D4F]">
            <Calendar className="h-4 w-4 text-[#4A7BA7]" />
            <span className="font-semibold">{formatDateLong(event.date)}</span>
          </div>
          {timeRange && (
            <div className="flex items-center justify-center gap-3 text-sm text-[#1B2D4F]">
              <Clock className="h-4 w-4 text-[#4A7BA7]" />
              <span className="font-semibold">{timeRange}</span>
            </div>
          )}
          {event.ticket_types.length > 0 && (
            <div className="pt-2 border-t text-center text-sm text-[#1B2D4F]">
              {event.ticket_types.map((tier) => (
                <p key={tier.tier}>
                  {tier.tier}: <span className="font-semibold">${tier.price.toLocaleString()}</span>
                </p>
              ))}
            </div>
          )}
          {event.payment_instructions && (
            <p className="text-xs text-center text-muted-foreground whitespace-pre-line">{event.payment_instructions}</p>
          )}
        </div>
      </section>

      <RegisterBlock event={event} isPast={isPast} contactHref={contactHref} variant="minimal" />

      {event.location && (
        <section className="py-8">
          <div className="mx-auto max-w-lg px-4 text-center">
            <h2 className="text-base font-bold text-[#1B2D4F]">Location</h2>
            <p className="mt-2 text-sm text-[#1B2D4F]/90">{event.location}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-[#3AAFA9] hover:underline"
            >
              Open in Google Maps →
            </a>
          </div>
        </section>
      )}

      <MinimalFooter />
    </div>
  );
}

interface EventLandingPageProps {
  event: EventLandingView;
}

export function EventLandingPage({ event }: EventLandingPageProps) {
  if (event.page_layout === "split") return <SplitLandingPage event={event} />;
  if (event.page_layout === "minimal") return <MinimalLandingPage event={event} />;
  return <ClassicLandingPage event={event} />;
}
