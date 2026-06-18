/**
 * Shared agent run lifecycle — used by nonprofit operational agents.
 * Activity log shape is provisional until aligned with CT-wide Time Saved spec (Abu Hurayra).
 */

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const ACTIVITY_ACTION_AI_AGENT_RUN = "ai_agent_run";
export const ACTIVITY_RESOURCE_AI_AGENT = "ai_agent";

export interface AgentActivityDetails {
  agent_slug: string;
  agent_run_id: string;
  time_saved_minutes: number;
  recommended_action: string;
  findings_count?: number;
  meeting_id?: string;
  model?: string;
  provider?: string;
}

export async function resolveAgentId(
  supabase: SupabaseClient,
  slug: string
): Promise<string | null> {
  const { data } = await supabase
    .from("ai_agents")
    .select("id")
    .eq("slug", slug)
    .eq("is_enabled", true)
    .maybeSingle();
  return data?.id ?? null;
}

export async function startAgentRun(
  supabase: SupabaseClient,
  params: {
    agentId: string;
    userId: string;
    input: Record<string, unknown>;
    context?: Record<string, unknown>;
  }
): Promise<string> {
  const startedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("ai_agent_runs")
    .insert({
      agent_id: params.agentId,
      user_id: params.userId,
      status: "running",
      input: params.input,
      context: params.context ?? {},
      started_at: startedAt,
      metadata: { agent_slug: params.context?.agent_slug },
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`Failed to start agent run: ${error?.message ?? "unknown"}`);
  }
  return data.id;
}

export async function completeAgentRun(
  supabase: SupabaseClient,
  params: {
    runId: string;
    output: Record<string, unknown>;
    metadata: Record<string, unknown>;
    modelUsed: string;
    providerUsed: string;
    latencyMs: number;
    tokenMetrics?: { prompt_tokens: number; completion_tokens: number };
  }
): Promise<void> {
  const { error } = await supabase
    .from("ai_agent_runs")
    .update({
      status: "completed",
      output: params.output,
      output_text: JSON.stringify(params.output),
      metadata: params.metadata,
      model_used: params.modelUsed,
      provider_used: params.providerUsed,
      latency_ms: params.latencyMs,
      token_metrics: params.tokenMetrics ?? {},
      completed_at: new Date().toISOString(),
    })
    .eq("id", params.runId);

  if (error) {
    console.error("[agent-run-lifecycle] completeAgentRun failed:", error.message);
  }
}

export async function failAgentRun(
  supabase: SupabaseClient,
  params: {
    runId: string;
    errorMessage: string;
    latencyMs?: number;
  }
): Promise<void> {
  const { error } = await supabase
    .from("ai_agent_runs")
    .update({
      status: "failed",
      error_message: params.errorMessage,
      latency_ms: params.latencyMs ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", params.runId);

  if (error) {
    console.error("[agent-run-lifecycle] failAgentRun failed:", error.message);
  }
}

export async function logAgentActivity(
  supabase: SupabaseClient,
  userId: string,
  details: AgentActivityDetails
): Promise<void> {
  const { error } = await supabase.from("activity_logs").insert({
    user_id: userId,
    action: ACTIVITY_ACTION_AI_AGENT_RUN,
    resource_type: ACTIVITY_RESOURCE_AI_AGENT,
    resource_id: details.agent_run_id,
    details: details as Record<string, unknown>,
  });

  if (error) {
    console.error("[agent-run-lifecycle] activity log failed:", error.message);
  }
}
