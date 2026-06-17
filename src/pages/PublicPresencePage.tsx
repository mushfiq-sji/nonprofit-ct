/**
 * Public Presence — /public-presence
 *
 * Configure what is visible on your public-facing website,
 * preview embeddable widgets, and manage social sharing links.
 * All data is demo data — no Supabase queries.
 */

import { useState } from "react";
import { toast } from "sonner";
import {
  Globe, Eye, EyeOff, Code, Share2, Copy, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DEMO_PUBLIC_PRESENCE,
  type PublicVisibilityConfig,
} from "@/shared/data/nonprofitDemoData";

// ── Types ─────────────────────────────────────────────────────────

type VisibilityKey = keyof PublicVisibilityConfig;

interface VisibilityItem {
  key: VisibilityKey;
  label: string;
  description: string;
}

// ── Data ─────────────────────────────────────────────────────────

const VISIBILITY_ITEMS: VisibilityItem[] = [
  { key: "publicEventFeed", label: "Public Event Feed", description: "Show upcoming events on your website so visitors can register" },
  { key: "donationWidget", label: "Donation Widget", description: "Embed a donate button and form on your website" },
  { key: "memberDirectoryPublic", label: "Member Directory", description: "Allow public visitors to browse your member directory" },
  { key: "programsPublicPage", label: "Programs Page", description: "Display your active programs and their impact publicly" },
  { key: "teamPage", label: "Team & Board Page", description: "Show your staff and board member profiles to the public" },
  { key: "impactStats", label: "Impact Stats", description: "Display live impact numbers — donors, volunteers, beneficiaries" },
];

// ── Component ─────────────────────────────────────────────────────

export default function PublicPresencePage() {
  const [visibility, setVisibility] = useState<PublicVisibilityConfig>(
    DEMO_PUBLIC_PRESENCE.visibility
  );

  const handleToggle = (key: VisibilityKey) => {
    setVisibility((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      const item = VISIBILITY_ITEMS.find((i) => i.key === key);
      const on = updated[key];
      toast.success(`${item?.label ?? key} ${on ? "enabled" : "disabled"}`, {
        description: on ? "Now visible to public visitors" : "Hidden from public visitors",
      });
      return updated;
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error("Failed to copy — please copy manually"));
  };

  const activeCount = Object.values(visibility).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Public Presence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure what the world sees — events, donations, and community presence
        </p>
      </div>

      {/* Status banner */}
      <div className="rounded-lg border bg-muted/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" />
          <div>
            <p className="text-sm font-medium">
              {activeCount} of {VISIBILITY_ITEMS.length} sections are publicly visible
            </p>
            <p className="text-xs text-muted-foreground">
              Last published: {DEMO_PUBLIC_PRESENCE.lastPublishedAt}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto shrink-0"
          onClick={() => window.open(DEMO_PUBLIC_PRESENCE.orgWebsiteUrl, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          Visit Website
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visibility" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 md:inline-flex md:h-10 md:w-auto md:flex-nowrap">
          <TabsTrigger value="visibility" className="w-full px-2 text-xs md:w-auto md:px-3 md:text-sm">
            <span className="md:hidden">Visibility</span>
            <span className="hidden md:inline">Visibility Controls</span>
          </TabsTrigger>
          <TabsTrigger value="previews" className="w-full px-2 text-xs md:w-auto md:px-3 md:text-sm">
            Previews
          </TabsTrigger>
          <TabsTrigger value="embed" className="w-full px-2 text-xs md:w-auto md:px-3 md:text-sm">
            <span className="md:hidden">Embed</span>
            <span className="hidden md:inline">Embed Codes</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="w-full px-2 text-xs md:w-auto md:px-3 md:text-sm">
            <span className="md:hidden">Social</span>
            <span className="hidden md:inline">Social Sharing</span>
          </TabsTrigger>
        </TabsList>

        {/* Visibility Controls Tab */}
        <TabsContent value="visibility">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Public Visibility Settings
              </CardTitle>
              <CardDescription>
                Toggle which sections appear on your public website. Changes take effect immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {VISIBILITY_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.label}</p>
                      {visibility[item.key] ? (
                        <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={visibility[item.key]}
                    onCheckedChange={() => handleToggle(item.key)}
                    aria-label={`Toggle ${item.label}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Previews Tab */}
        <TabsContent value="previews" className="space-y-4">
          {/* Event Feed Preview */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base">Public Event Feed</CardTitle>
                <Badge
                  variant={visibility.publicEventFeed ? "outline" : "secondary"}
                  className={`w-fit shrink-0 whitespace-normal ${visibility.publicEventFeed ? "text-green-700 border-green-200 bg-green-50" : ""}`}
                >
                  {visibility.publicEventFeed ? "Live" : "Hidden"}
                </Badge>
              </div>
              <CardDescription>How your events appear to public visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                {[
                  { title: "Summer Leadership Summit", date: "In 45 days", tag: "Upcoming" },
                  { title: "Monthly Community Dinner", date: "In 12 days", tag: "Free" },
                  { title: "Community Health Fair", date: "Today", tag: "Active" },
                ].map((event) => (
                  <div
                    key={event.title}
                    className="flex flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium break-words">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:shrink-0">
                      <Badge variant="secondary" className="w-fit text-xs whitespace-normal">
                        {event.tag}
                      </Badge>
                      <Button size="sm" variant="outline" className="h-8 w-full text-xs sm:w-auto">
                        Register
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Donation Widget Preview */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base">Donation Widget</CardTitle>
                <Badge
                  variant={visibility.donationWidget ? "outline" : "secondary"}
                  className={`w-fit shrink-0 whitespace-normal ${visibility.donationWidget ? "text-green-700 border-green-200 bg-green-50" : ""}`}
                >
                  {visibility.donationWidget ? "Live" : "Hidden"}
                </Badge>
              </div>
              <CardDescription>Embedded donate experience for your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mx-auto w-full max-w-xs space-y-4 rounded-lg border bg-muted/30 p-4 text-center sm:p-6">
                <p className="font-semibold break-words">Support Brightside Foundation</p>
                <p className="text-xs text-muted-foreground">Your gift changes lives in our community</p>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map((amt) => (
                    <Button key={amt} size="sm" variant="outline" className="px-2 text-xs">
                      ${amt}
                    </Button>
                  ))}
                </div>
                <Button className="w-full" size="sm">Donate Now</Button>
                <p className="text-xs text-muted-foreground">🔒 Secure · Tax-deductible</p>
              </div>
            </CardContent>
          </Card>

          {/* Impact Stats Preview */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base">Impact Stats</CardTitle>
                <Badge
                  variant={visibility.impactStats ? "outline" : "secondary"}
                  className={`w-fit shrink-0 whitespace-normal ${visibility.impactStats ? "text-green-700 border-green-200 bg-green-50" : ""}`}
                >
                  {visibility.impactStats ? "Live" : "Hidden"}
                </Badge>
              </div>
              <CardDescription>Live numbers shown on your public website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
                {[
                  { value: "1,010+", label: "People Served" },
                  { value: "4,320", label: "Volunteer Hours" },
                  { value: "$284K", label: "Funds Raised" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-md border bg-background p-3 text-center sm:border-0 sm:bg-transparent sm:p-0">
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Embed Codes Tab */}
        <TabsContent value="embed" className="space-y-4">
          {/* Donation Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                Donation Widget Embed
              </CardTitle>
              <CardDescription>
                Paste this code into your website to add a donation widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto font-mono whitespace-pre-wrap break-all">
                  {DEMO_PUBLIC_PRESENCE.embedCodes.donationWidget}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(DEMO_PUBLIC_PRESENCE.embedCodes.donationWidget, "Donation widget embed code")}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                Event Feed Embed
              </CardTitle>
              <CardDescription>
                Paste this code into your website to show upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto font-mono whitespace-pre-wrap break-all">
                  {DEMO_PUBLIC_PRESENCE.embedCodes.eventFeed}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(DEMO_PUBLIC_PRESENCE.embedCodes.eventFeed, "Event feed embed code")}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Sharing Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                Social Media Profiles
              </CardTitle>
              <CardDescription>Your organization's social media presence</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {[
                { platform: "Facebook", value: DEMO_PUBLIC_PRESENCE.social.facebookUrl, icon: "f" },
                { platform: "Twitter / X", value: DEMO_PUBLIC_PRESENCE.social.twitterHandle, icon: "𝕏" },
                { platform: "LinkedIn", value: DEMO_PUBLIC_PRESENCE.social.linkedinUrl, icon: "in" },
                { platform: "Instagram", value: DEMO_PUBLIC_PRESENCE.social.instagramHandle, icon: "📷" },
              ].map((social) => (
                <div
                  key={social.platform}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                      {social.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{social.platform}</p>
                      <p className="break-all text-xs text-muted-foreground">{social.value}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleCopy(social.value, `${social.platform} link`)}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5 sm:mr-0" />
                      <span className="sm:hidden">Copy</span>
                    </Button>
                    {social.value.startsWith("http") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => window.open(social.value, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5 sm:mr-0" />
                        <span className="sm:hidden">Open</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
