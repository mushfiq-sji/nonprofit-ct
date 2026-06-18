import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { invalidateKeys } from "@/lib/cache";
import type { ActionItemTrackerAgentResponse } from "@/types/action-item-tracker";

const FN_NAME = "action-item-tracker";
const MODEL = "gpt-4o";

export interface ActionItemTrackerRunResult {
  runId: string;
  result: ActionItemTrackerAgentResponse["result"];
  timeSavedMinutes: number;
  recommendedAction: string;
  model: string;
  provider: string;
  latencyMs: number;
}

function isAgentResponse(data: unknown): data is ActionItemTrackerAgentResponse {
  return (
    data !== null &&
    typeof data === "object" &&
    "run_id" in data &&
    "result" in data &&
    typeof (data as ActionItemTrackerAgentResponse).run_id === "string"
  );
}

async function parseFunctionsError(error: FunctionsHttpError): Promise<string> {
  try {
    const body = await error.context.json();
    if (body && typeof body === "object" && "message" in body) {
      return String((body as { message: string }).message);
    }
  } catch {
    // ignore
  }
  return error.message || "Action Item Tracker failed";
}

export function useActionItemTracker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: { useSample?: boolean }): Promise<ActionItemTrackerRunResult> => {
      const { data, error } = await supabase.functions.invoke(FN_NAME, {
        body: {
          log_run: true,
          use_sample: options?.useSample ?? false,
        },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          throw new Error(await parseFunctionsError(error));
        }
        throw new Error(error.message || "Action Item Tracker failed");
      }

      if (data && typeof data === "object" && "error" in data) {
        const msg =
          "message" in data && data.message
            ? String((data as { message: string }).message)
            : String((data as { error: string }).error);
        throw new Error(msg);
      }

      if (!isAgentResponse(data)) {
        throw new Error("Unexpected response from Action Item Tracker");
      }

      return {
        runId: data.run_id,
        result: data.result,
        timeSavedMinutes: data.time_saved_minutes,
        recommendedAction: data.recommended_action,
        model: data.model || MODEL,
        provider: data.provider || FN_NAME,
        latencyMs: data.latency_ms,
      };
    },
    onSuccess: () => {
      invalidateKeys.ai(queryClient);
    },
  });
}
