/**
 * Probe which meeting-summary backends are reachable on the linked Supabase project.
 * Read-only health checks — cannot deploy functions.
 */

import { supabase } from "@/integrations/supabase/client";
import { API } from "@/shared/config/api";

export type BackendProbeStatus = "active" | "missing" | "error";

export interface SummarizerBackendProbe {
  name: string;
  status: BackendProbeStatus;
  detail: string;
}

async function probe(
  label: string,
  name: string,
  body: Record<string, unknown>
): Promise<SummarizerBackendProbe> {
  const { data, error } = await supabase.functions.invoke(name, { body });

  const errMsg = error?.message ?? "";
  if (errMsg.includes("NOT_FOUND") || errMsg.includes("404")) {
    return { name: label, status: "missing", detail: "Not deployed on this project" };
  }

  if (error) {
    if (errMsg.includes("non-2xx")) {
      const dataErr =
        data && typeof data === "object" && "error" in data
          ? String((data as { error: string }).error)
          : errMsg;
      return { name: label, status: "active", detail: dataErr };
    }
    return { name: label, status: "error", detail: errMsg };
  }

  if (data && typeof data === "object" && "error" in data) {
    return {
      name: label,
      status: "active",
      detail: String((data as { error: string }).error),
    };
  }

  if (data && typeof data === "object" && "executive_summary" in data) {
    const model =
      "model" in data ? String((data as { model: string }).model) : "claude-sonnet-4-20250514";
    return { name: label, status: "active", detail: `Sonnet OK — ${model}` };
  }

  return { name: label, status: "active", detail: "Responding" };
}

/** Which edge endpoints exist on the linked cloud project (Lovable / Supabase). */
export async function probeMeetingSummarizerBackends(): Promise<SummarizerBackendProbe[]> {
  return [
    await probe(
      "event-intelligence (Sonnet mode)",
      API.AI.EVENT_INTELLIGENCE,
      {
        mode: "meeting_summary",
        transcript: "Board meeting health check. Chair: Patricia. Decision: approve budget.",
      }
    ),
    await probe("event-intelligence (Gemini Q&A)", API.AI.EVENT_INTELLIGENCE, {
      question: "health check ping",
    }),
    await probe("meeting-summarizer", API.MEETINGS.SUMMARIZER, { transcript: "health check" }),
    await probe("generate-meeting-summary-v2", "generate-meeting-summary-v2", {
      transcript: "health check",
    }),
  ];
}
