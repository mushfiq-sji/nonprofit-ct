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
          onClick={() => window.open(DEMO_PUBLIC_PRESENCE.orgWebsiteUrl, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          Visit Website
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visibility" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visibility">Visibility Controls</TabsTrigger>
          <TabsTrigger value="previews">Previews</TabsTrigger>
          <TabsTrigger value="embed">Embed Codes</TabsTrigger>
          <TabsTrigger value="social">Social Sharing</TabsTrigger>
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Public Event Feed</CardTitle>
                <Badge variant={visibility.publicEventFeed ? "outline" : "secondary"} className={visibility.publicEventFeed ? "text-green-700 border-green-200 bg-green-50" : ""}>
                  {visibility.publicEventFeed ? "Live" : "Hidden"}
                </Badge>
              </div>
              <CardDescription>How your events appear to public visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                {[
                  { title: "Summer Leadership Summit", date: "In 45 days", tag: "Upcoming" },
                  { title: "Monthly Community Dinner", date: "In 12 days", tag: "Free" },
                  { title: "Community Health Fair", date: "Today", tag: "Active" },
                ].map((event) => (
                  <div key={event.title} className="flex items-center justify-between border rounded-md bg-background p-3">
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{event.tag}</Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Register</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Donation Widget Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Donation Widget</CardTitle>
                <Badge variant={visibility.donationWidget ? "outline" : "secondary"} className={visibility.donationWidget ? "text-green-700 border-green-200 bg-green-50" : ""}>
                  {visibility.donationWidget ? "Live" : "Hidden"}
                </Badge>
              </div>
              <CardDescription>Embedded donate experience for your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-muted/30 p-6 max-w-xs text-center space-y-4">
                <p className="font-semibold">Support Brightside Foundation</p>
                <p className="text-xs text-muted-foreground">Your gift changes lives in our community</p>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map((amt) => (
                    <Button key={amt} size="sm" variant="outline" className="text-xs">${amt}</Button>
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Impact Stats</CardTitle>
                <Badge variant={visibility.impactStats ? "outline" : "secondary"} className={visibility.impactStats ? "text-green-700 border-green-200 bg-green-50" : ""}>
                  {visibility.impactStats ? "Live" : "Hidden"}
                </Badge>
              </div>
              <CardDescription>Live numbers shown on your public website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 rounded-lg border bg-muted/30 p-4">
                {[
                  { value: "1,010+", label: "People Served" },
                  { value: "4,320", label: "Volunteer Hours" },
                  { value: "$284K", label: "Funds Raised" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
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
                <div key={social.platform} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                      {social.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{social.platform}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{social.value}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(social.value, `${social.platform} link`)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {social.value.startsWith("http") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(social.value, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
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
