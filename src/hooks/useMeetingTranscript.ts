/**
 * useMeetingTranscript
 *
 * Fetches transcript from meeting_transcripts table for a single meeting.
 * The table has: id, meeting_id, content, summary, source, created_at, updated_at
 * (no 'speaker' column)
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/cache";

export interface TranscriptTurn {
  timestamp: string;
  speaker?: string;
  text: string;
}

export interface MeetingTranscript {
  status: "pending" | "processing" | "complete" | "failed";
  turns: TranscriptTurn[];
  content: string | null;
  error: string | null;
}

export function useMeetingTranscript(meetingId: string) {
  const { data, isLoading, error } = useQuery<MeetingTranscript>({
    queryKey: queryKeys.meetings.transcript(meetingId),
    queryFn: async (): Promise<MeetingTranscript> => {
      const { data: transcripts, error: dbError } = await supabase
        .from("meeting_transcripts")
        .select("content, created_at")
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });

      if (dbError) throw dbError;

      const parsed: TranscriptTurn[] = (transcripts ?? []).map((t) => ({
        timestamp: t.created_at,
        text: t.content ?? "",
      }));

      const fullContent = parsed.map((t) => t.text).join("\n\n");

      return {
        status: parsed.length > 0 ? "complete" : "pending",
        turns: parsed,
        content: fullContent || null,
        error: null,
      };
    },
    enabled: !!meetingId,
  });

  return {
    transcript: data,
    status: data?.status ?? "pending",
    error: data?.error ?? null,
    isLoading,
    queryError: error,
  };
}
