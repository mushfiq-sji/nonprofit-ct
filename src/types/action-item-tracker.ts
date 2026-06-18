export type BoardActionFlag = "overdue" | "blocked" | "due_soon" | "on_track";

export interface BoardActionItem {
  id: string;
  title: string;
  owner: string | null;
  due_date: string | null;
  status: string;
  flag: BoardActionFlag;
  days_overdue?: number | null;
  days_until_due?: number | null;
  blocker_reason?: string | null;
  source?: "task" | "meeting_takeaway" | "sample";
}

export interface ActionItemTrackerResult {
  summary: string;
  total_pending: number;
  overdue: BoardActionItem[];
  blocked: BoardActionItem[];
  due_soon: BoardActionItem[];
  on_track_count: number;
  time_saved_minutes: number;
  recommended_action: string;
}

export interface ActionItemTrackerAgentResponse {
  run_id: string;
  result: ActionItemTrackerResult;
  time_saved_minutes: number;
  recommended_action: string;
  model: string;
  provider: string;
  latency_ms: number;
}
