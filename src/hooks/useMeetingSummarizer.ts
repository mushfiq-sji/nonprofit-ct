/**
 * Meeting Summarizer Hook — Claude Sonnet 4 via Lovable gateway.
 *
 * Priority: client key (local dev) → meeting-summarizer edge → event-intelligence Sonnet mode.
 */

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { API } from "@/shared/config/api";
import {
  MEETING_SUMMARIZER_MODEL,
  parseMeetingSummaryResponse,
  summarizeMeetingWithClaudeSonnet,
} from "@/lib/meetingSummarizer";
import type { MeetingSummary } from "@/types/meeting-summary";

export interface MeetingSummarizerResult {
  summary: MeetingSummary;
  latencyMs: number;
  model: string;
  provider: string;
}

function extractErrorMessage(error: unknown, data: unknown): string {
  if (data && typeof data === "object" && "error" in data) {
    return String((data as { error: string }).error);
  }
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("NOT_FOUND") || msg.includes("non-2xx")) {
      return "AI backend not available on cloud — see dev banner for Claude Sonnet setup.";
    }
    return msg;
  }
  return "Failed to generate meeting minutes";
}

function isMeetingSummaryShape(data: unknown): data is MeetingSummary {
  return (
    data !== null &&
    typeof data === "object" &&
    "executive_summary" in data &&
    "decisions" in data &&
    "action_items" in data
  );
}

function summaryFromEdgePayload(data: unknown): MeetingSummary {
  if (isMeetingSummaryShape(data)) {
    return data;
  }
  if (data && typeof data === "object" && "response" in data) {
    return parseMeetingSummaryResponse(String((data as { response: string }).response));
  }
  throw new Error("Unexpected response shape from AI service");
}

async function tryMeetingSummarizerEdge(transcript: string): Promise<MeetingSummarizerResult> {
  const start = Date.now();
  const { data, error } = await supabase.functions.invoke(API.MEETINGS.SUMMARIZER, {
    body: { transcript },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, data));
  }
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(extractErrorMessage(null, data));
  }

  const model =
    data && typeof data === "object" && "model" in data
      ? String((data as { model: string }).model)
      : MEETING_SUMMARIZER_MODEL;

  return {
    summary: summaryFromEdgePayload(data),
    latencyMs: Date.now() - start,
    model,
    provider: "meeting-summarizer",
  };
}

async function tryEventIntelligenceSonnet(transcript: string): Promise<MeetingSummarizerResult> {
  const start = Date.now();
  const { data, error } = await supabase.functions.invoke(API.AI.EVENT_INTELLIGENCE, {
    body: { mode: "meeting_summary", transcript },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, data));
  }
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(extractErrorMessage(null, data));
  }

  const model =
    data && typeof data === "object" && "model" in data
      ? String((data as { model: string }).model)
      : MEETING_SUMMARIZER_MODEL;

  return {
    summary: summaryFromEdgePayload(data),
    latencyMs: Date.now() - start,
    model,
    provider: "event-intelligence",
  };
}

async function tryClientSonnet(transcript: string): Promise<MeetingSummarizerResult> {
  const start = Date.now();
  const summary = await summarizeMeetingWithClaudeSonnet(transcript);
  return {
    summary,
    latencyMs: Date.now() - start,
    model: MEETING_SUMMARIZER_MODEL,
    provider: "lovable-client",
  };
}

export function useMeetingSummarizer() {
  return useMutation({
    mutationFn: async (transcript: string): Promise<MeetingSummarizerResult> => {
      const trimmed = transcript.trim();
      const attempts: Array<{ name: string; fn: () => Promise<MeetingSummarizerResult> }> = [];

      if (import.meta.env.VITE_LOVABLE_API_KEY) {
        attempts.push({ name: "client", fn: () => tryClientSonnet(trimmed) });
      }
      attempts.push(
        { name: "meeting-summarizer", fn: () => tryMeetingSummarizerEdge(trimmed) },
        { name: "event-intelligence", fn: () => tryEventIntelligenceSonnet(trimmed) },
      );

      const errors: string[] = [];
      for (const { name, fn } of attempts) {
        try {
          return await fn();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`${name}: ${msg}`);
        }
      }

      throw new Error(
        errors.length > 0
          ? `Claude Sonnet unavailable. ${errors.join(" | ")}`
          : "Claude Sonnet unavailable — add VITE_LOVABLE_API_KEY to .env or update event-intelligence on Lovable."
      );
    },
  });
}
