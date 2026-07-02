import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutTemplate, ExternalLink, CheckCircle, Clock, Loader2 } from "lucide-react";
import { EVENT_PAGE_LAYOUTS, getEventPageLayout, type EventPageLayoutId } from "@/lib/eventPageLayouts";
import {
  useEventLandingPageActivity,
  useEventLandingPageDesignerStats,
} from "@/hooks/useEventLandingPageDesigner";

function parsePageLayout(raw: string | null | undefined): EventPageLayoutId {
  if (raw === "split" || raw === "minimal" || raw === "classic") return raw;
  return "classic";
}

function formatActivityTime(createdAt: string | null): string {
  if (!createdAt) return "—";
  return new Date(createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventPageDesignerDetail() {
  const {
    landingPages,
    publishedCount,
    estimatedHoursSaved,
    isPending: pagesPending,
    isError: pagesError,
  } = useEventLandingPageDesignerStats();

  const {
    data: activityLog = [],
    isPending: activityPending,
    isError: activityError,
  } = useEventLandingPageActivity(8);

  const isPending = pagesPending || activityPending;
  const isError = pagesError || activityError;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{EVENT_PAGE_LAYOUTS.length}</p>
            <p className="text-xs text-muted-foreground">Layout templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            <p className="text-xs text-muted-foreground">Pages published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{estimatedHoursSaved} hrs</p>
            <p className="text-xs text-muted-foreground">Est. time saved</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            Layout Templates
          </CardTitle>
          <CardDescription>
            Each template changes the full public page — hero, sections, registration block, and footer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {EVENT_PAGE_LAYOUTS.map((layout) => (
              <div key={layout.id} className="rounded-lg border p-4 bg-muted/30">
                <p className="font-semibold text-sm">{layout.label}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">{layout.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Landing Pages</CardTitle>
          <CardDescription>
            From Event Page Designer registry ({landingPages.length} configured)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isPending ? (
            <>
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">
              Could not load landing page registry. Run{" "}
              <code className="text-xs">20260702140000_event_landing_page_designer.sql</code> in Lovable SQL
              Editor if tables are missing.
            </p>
          ) : landingPages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No landing pages configured yet. Open an event in{" "}
              <Link to="/events?tab=manage" className="text-primary font-medium hover:underline">
                Event Management
              </Link>{" "}
              and click Landing to get started.
            </p>
          ) : (
            landingPages.map((page) => {
              const layoutLabel = getEventPageLayout(parsePageLayout(page.page_layout)).label;
              const isPublished = page.is_published && Boolean(page.slug);
              return (
                <div
                  key={page.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{page.event_title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {layoutLabel}
                      </Badge>
                      <Badge variant={isPublished ? "default" : "outline"} className="text-xs">
                        {isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  {isPublished && page.slug && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/events/${page.slug}`} target="_blank" rel="noreferrer">
                        View page <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Activity Log
          </CardTitle>
          <CardDescription>Recorded when landing pages are saved, published, or removed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isPending ? (
            <Skeleton className="h-16 w-full" />
          ) : activityError ? (
            <p className="text-sm text-muted-foreground">Could not load activity log.</p>
          ) : activityLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No landing page activity yet.</p>
          ) : (
            activityLog.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0 w-24">
                  {formatActivityTime(entry.created_at)}
                </span>
                <span className="text-foreground">{entry.summary}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/events?tab=manage">
            <LayoutTemplate className="h-4 w-4 mr-2" />
            Open Event Management
          </Link>
        </Button>
        <Button variant="outline" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Auto-design from event details (coming soon)
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
        Event Page Designer assists whenever you open Landing settings on an event.
      </div>
    </div>
  );
}
