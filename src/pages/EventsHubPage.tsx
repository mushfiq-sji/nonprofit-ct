/**
 * Events Hub — /events
 *
 * Single tabbed surface for the full event domain:
 * - Manage: event lifecycle (create, capacity, registrations, check-in) — live DB
 * - Post-Event: engagement intelligence, follow-up automation, AI insights
 *
 * Tabs are deep-linkable via ?tab=manage | ?tab=post-event.
 * /event-management redirects here.
 */

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventLifecycleTab } from "@/components/events/EventLifecycleTab";
import { PostEventIntelligenceTab } from "@/components/events/PostEventIntelligenceTab";
import { queryKeys, cacheConfig } from "@/lib/cache";
import { supabase } from "@/integrations/supabase/client";
import type { NonprofitEvent } from "@/hooks/useNonprofitEvents";

const VALID_TABS = ["manage", "post-event"] as const;
type EventsTab = (typeof VALID_TABS)[number];

export default function EventsHubPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: EventsTab = VALID_TABS.includes(tabParam as EventsTab)
    ? (tabParam as EventsTab)
    : "manage";

  useEffect(() => {
    if (!tabParam || !VALID_TABS.includes(tabParam as EventsTab)) {
      setSearchParams({ tab: "manage" }, { replace: true });
    }
  }, [tabParam, setSearchParams]);

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.nonprofit.events.list(undefined),
      staleTime: cacheConfig.staleTime.medium,
      queryFn: async (): Promise<NonprofitEvent[]> => {
        const { data, error } = await supabase
          .from("nonprofit_events")
          .select("*")
          .order("date", { ascending: false });
        if (error) throw error;
        return (data ?? []) as NonprofitEvent[];
      },
    });
  }, [queryClient]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Events
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Brightside Foundation · Full event lifecycle — from creation and check-in to post-event follow-up
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="post-event">Post-Event Intelligence</TabsTrigger>
        </TabsList>
        <TabsContent value="manage" forceMount className="mt-6 data-[state=inactive]:hidden">
          <EventLifecycleTab onViewPostEvent={() => handleTabChange("post-event")} />
        </TabsContent>
        <TabsContent value="post-event" className="mt-6">
          <PostEventIntelligenceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
