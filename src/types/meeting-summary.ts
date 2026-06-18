/**
 * Structured meeting minutes returned by the meeting-summarizer edge function.
 * Mirror this shape in supabase/functions/meeting-summarizer/index.ts system prompt.
 */
export interface MeetingSummaryActionItem {
  task: string;
  owner: string | null;
  deadline: string | null;
}

export interface MeetingSummary {
  executive_summary: string;
  decisions: string[];
  action_items: MeetingSummaryActionItem[];
  attendance: string[];
  key_discussion_points: string[];
  /** Estimated staff minutes saved vs manual minute-taking (model estimate). */
  time_saved_minutes?: number;
  /** Single next step the user should take from this output. */
  recommended_action?: string;
}

/** Full response from meeting-summarizer edge function with run tracking. */
export interface MeetingSummarizerAgentResponse {
  run_id: string;
  summary: MeetingSummary;
  time_saved_minutes: number;
  recommended_action: string;
  model: string;
  provider: string;
  latency_ms: number;
  meeting_id?: string | null;
}
