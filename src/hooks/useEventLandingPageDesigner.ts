import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, cacheConfig } from "@/lib/cache";
import type { Database } from "@/integrations/supabase/types";

export type EventLandingPageRecord =
  Database["public"]["Tables"]["nonprofit_event_landing_pages"]["Row"];

export type EventLandingPageActivityRecord =
  Database["public"]["Tables"]["nonprofit_event_landing_page_activity"]["Row"];

export function useEventLandingPages() {
  return useQuery({
    queryKey: queryKeys.nonprofit.eventLandingPages.list(),
    staleTime: cacheConfig.staleTime.medium,
    gcTime: cacheConfig.gcTime.long,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<EventLandingPageRecord[]> => {
      const { data, error } = await supabase
        .from("nonprofit_event_landing_pages")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as EventLandingPageRecord[];
    },
  });
}

export function useEventLandingPageActivity(limit = 20) {
  return useQuery({
    queryKey: queryKeys.nonprofit.eventLandingPages.activity(limit),
    staleTime: cacheConfig.staleTime.medium,
    gcTime: cacheConfig.gcTime.long,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<EventLandingPageActivityRecord[]> => {
      const { data, error } = await supabase
        .from("nonprofit_event_landing_page_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as EventLandingPageActivityRecord[];
    },
  });
}

export function useEventLandingPageDesignerStats() {
  const pagesQuery = useEventLandingPages();

  const landingPages = pagesQuery.data ?? [];
  const publishedCount = landingPages.filter((page) => page.is_published && page.slug).length;
  const estimatedHoursSaved = Math.max(1, Math.round(landingPages.length * 0.75));

  return {
    ...pagesQuery,
    landingPages,
    publishedCount,
    estimatedHoursSaved,
  };
}
