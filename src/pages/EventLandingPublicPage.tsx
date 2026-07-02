import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { EventLandingPage } from "@/components/events/EventLandingPage";
import { useEventLandingBySlug } from "@/hooks/useNonprofitEvents";

export default function EventLandingPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading, isError } = useEventLandingBySlug(slug ?? "");

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <p className="text-muted-foreground">Missing event slug.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          This event may be unpublished or the link is incorrect. Published events must have
          &quot;Publish landing page&quot; enabled in Event Management.
        </p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-1 text-primary font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    );
  }

  return <EventLandingPage event={event} />;
}
