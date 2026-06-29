/**
 * Client-side dummy data for the four named nonprofit agents (demo / offline).
 */

import { CLIENT_AGENT_FALLBACKS } from "@/lib/agentClientFallbacks";
import {
  DEMO_VOLUNTEERS,
  type Grant,
  type DemoVolunteer,
} from "@/shared/data/nonprofitDemoData";
import type { DonorChurnRiskResult } from "@/types/donor-churn-risk";
import type { MeetingSummary } from "@/types/meeting-summary";
import { buildMeetingSummaryFallback } from "@/lib/agentResponseNormalize";
import { BRIGHTSIDE_BOARD_MEETING_SAMPLE } from "@/shared/data/brightsideBoardMeetingSample";

export function simulateAgentDelay(ms = 1100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDonorEngagementDummyResult(): DonorChurnRiskResult {
  return CLIENT_AGENT_FALLBACKS["donor-engagement"];
}

export function buildGrantWriterDummyDraft(
  grant: Grant,
  section: string,
  programNames: string[]
): string {
  const programs =
    programNames.length > 0
      ? programNames.join(", ")
      : "Youth Leadership Academy and Community Health Initiative";

  const utilization = grant.utilized ?? 0;
  const amount = grant.amount?.toLocaleString() ?? "—";

  const templates: Record<string, string> = {
    "Statement of Need": `Brightside Foundation serves over 2,400 individuals annually across Queens and surrounding communities. Despite strong program outcomes, ${grant.funder} funding at $${amount} addresses a documented gap: families in our service area report limited access to wraparound support that connects education, health, and economic mobility.

Our ${programs} directly respond to this need. Current utilization at ${utilization}% reflects steady delivery against approved scope, with waitlists in two program tracks indicating unmet demand. Without continued investment, 180+ youth and 90+ adults would lose structured mentorship and health navigation services this fiscal year.`,

    "Program Narrative": `Through ${programs}, Brightside Foundation delivers measurable outcomes aligned with ${grant.name} objectives.

Youth participants complete structured leadership curricula with 87% reporting improved confidence and post-secondary planning. Community health programming connects 340+ individuals annually to screenings and follow-up care. Staff coordinate across grants to avoid duplication while maintaining fidelity to funder reporting requirements.

This narrative reflects live program data from our impact dashboard and aligns with ${grant.funder}'s priority on equitable community development.`,

    "Evaluation Plan": `Evaluation for ${grant.name} uses a mixed-methods approach:

• Outputs: enrollment, attendance, service contacts (monthly CRM export)
• Outcomes: pre/post surveys on confidence, health access, and employment readiness (quarterly)
• Fidelity: supervisor observation rubrics for ${programs} (semi-annual)

An external evaluator will review Q2 and Q4 summaries. Data feeds our board dashboard and this ${grant.funder} report. Baseline established at grant start; targets set at 10% improvement in primary outcome indicators year over year.`,

    "Budget Justification": `The approved award of $${amount} for ${grant.name} supports personnel (${utilization}% utilized to date), program supplies, and contracted services for ${programs}.

Personnel (62%): program managers and direct service staff proportional to enrollment.
Program costs (28%): materials, transportation, and event support tied to service delivery.
Administrative (10%): finance, compliance, and grant reporting — within funder cap.

Variance explanations are documented monthly. Restricted funds are tracked in QuickBooks by grant code with monthly reconciliation to Salesforce gift records.`,

    "Executive Summary": `${grant.funder} — ${grant.name}

Brightside Foundation respectfully submits this ${section.toLowerCase()} for the reporting period. Our ${programs} remain on track at ${utilization}% utilization against the $${amount} award.

Highlights: strong youth retention, expanded health fair reach, and board-approved expansion of volunteer capacity. Immediate priorities include Q2 narrative completion and major-donor stewardship for sustainability beyond grant term.`,
  };

  return (
    templates[section] ??
    `Draft ${section} for ${grant.name} (${grant.funder}), incorporating ${programs}. Award: $${amount}; utilization: ${utilization}%. [Demo draft — edit before submission.]`
  );
}

export interface VolunteerShiftRow {
  id: string;
  event_name: string;
  date: string;
  volunteer_id: string;
  volunteerName: string;
  hours: number;
  status: string;
  suggestedMatchIds: string[];
  suggestedMatchNames: string[];
}

function suggestDemoVolunteers(eventName: string, volunteers: DemoVolunteer[], excludeId?: string): DemoVolunteer[] {
  const keywords = eventName.toLowerCase().split(/[\s,/]+/).filter((w) => w.length > 2);
  const scored = volunteers
    .filter((v) => v.id !== excludeId)
    .map((v) => {
      let score = 0;
      for (const skill of v.skills) {
        const s = skill.toLowerCase();
        if (keywords.some((k) => s.includes(k) || k.includes(s))) score += 2;
        if (eventName.toLowerCase().includes(s)) score += 1;
      }
      if (eventName.toLowerCase().includes("gala") && v.skills.some((s) => /event|fundraising/i.test(s)))
        score += 2;
      return { volunteer: v, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) return scored.slice(0, 2).map((x) => x.volunteer);

  return volunteers
    .filter((v) => v.id !== excludeId)
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 2);
}

export function buildVolunteerCoordinatorDemoRows(): VolunteerShiftRow[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows: VolunteerShiftRow[] = [];

  for (const volunteer of DEMO_VOLUNTEERS) {
    for (const shift of volunteer.shifts) {
      if (shift.status !== "Upcoming") continue;
      if (new Date(shift.date) < today) continue;

      const backups = suggestDemoVolunteers(shift.eventName, DEMO_VOLUNTEERS, volunteer.id);
      rows.push({
        id: shift.id,
        event_name: shift.eventName,
        date: shift.date,
        volunteer_id: volunteer.id,
        volunteerName: volunteer.name,
        hours: shift.hours,
        status: shift.status,
        suggestedMatchIds: backups.map((b) => b.id),
        suggestedMatchNames: backups.map((b) => b.name),
      });
    }
  }

  return rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getVolunteerHoursDemoSummary(): { id: string; name: string; skills: string[]; total_hours: number }[] {
  return [...DEMO_VOLUNTEERS]
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 8)
    .map((v) => ({
      id: v.id,
      name: v.name,
      skills: v.skills,
      total_hours: v.totalHours,
    }));
}

export function buildBoardMeetingDummySummary(transcript?: string): MeetingSummary {
  const text = transcript?.trim() || BRIGHTSIDE_BOARD_MEETING_SAMPLE;
  return buildMeetingSummaryFallback(text);
}

export function formatMeetingSummaryAsText(summary: MeetingSummary): string {
  const lines: string[] = [
    "EXECUTIVE SUMMARY",
    summary.executive_summary,
    "",
    "ATTENDANCE",
    ...summary.attendance.map((a) => `• ${a}`),
    "",
    "DECISIONS",
    ...summary.decisions.map((d, i) => `${i + 1}. ${d}`),
    "",
    "ACTION ITEMS",
    ...summary.action_items.map(
      (a) => `• ${a.task}${a.owner ? ` — ${a.owner}` : ""}${a.deadline ? ` (due ${a.deadline})` : ""}`
    ),
    "",
    "KEY DISCUSSION",
    ...summary.key_discussion_points.map((p) => `• ${p}`),
  ];
  return lines.join("\n");
}
