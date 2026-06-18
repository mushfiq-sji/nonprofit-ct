/**
 * Sample board action items for Action Item Tracker demo when the tasks table is empty.
 * Brightside Foundation Q2 2026 board follow-ups.
 */
import type { BoardActionItem } from "@/types/action-item-tracker";

export const BOARD_ACTION_ITEMS_SAMPLE: BoardActionItem[] = [
  {
    id: "sample-1",
    title: "Finalize FY27 operating budget draft for board vote",
    owner: "Patricia Okonkwo (ED)",
    due_date: "2026-04-10",
    status: "open",
    flag: "overdue",
    days_overdue: 68,
    source: "sample",
  },
  {
    id: "sample-2",
    title: "Submit Kresge Foundation Q2 narrative report",
    owner: "James Liu (Development)",
    due_date: "2026-06-20",
    status: "in_progress",
    flag: "due_soon",
    days_until_due: 3,
    source: "sample",
  },
  {
    id: "sample-3",
    title: "Recruit two at-large board members — diversity committee shortlist",
    owner: "Maria Santos (Board Chair)",
    due_date: "2026-05-15",
    status: "blocked",
    flag: "blocked",
    blocker_reason: "Waiting on governance committee revised charter approval",
    source: "sample",
  },
  {
    id: "sample-4",
    title: "Approve updated conflict-of-interest policy language",
    owner: "Legal subcommittee",
    due_date: "2026-07-01",
    status: "open",
    flag: "on_track",
    days_until_due: 14,
    source: "sample",
  },
  {
    id: "sample-5",
    title: "Review ED compensation benchmark study",
    owner: "Executive Committee",
    due_date: "2026-04-30",
    status: "open",
    flag: "overdue",
    days_overdue: 48,
    source: "sample",
  },
  {
    id: "sample-6",
    title: "Sign off on Spring Gala reconciliation package",
    owner: "David Kim (Treasurer)",
    due_date: "2026-06-25",
    status: "open",
    flag: "due_soon",
    days_until_due: 8,
    source: "sample",
  },
];
