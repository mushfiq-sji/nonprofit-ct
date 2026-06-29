import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  HandHeart,
  Loader2,
  Mail,
  Sparkles,
  UserPlus,
  Users,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useVolunteers, useAllShifts, type Volunteer } from "@/hooks/useVolunteers";
import { useLiveAgentDetailBootstrap } from "@/hooks/useLiveAgentDetailBootstrap";
import {
  buildVolunteerCoordinatorDemoRows,
  getVolunteerHoursDemoSummary,
  simulateAgentDelay,
  type VolunteerShiftRow,
} from "@/lib/agentDummyData";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scoreVolunteerMatch(eventName: string, volunteer: Volunteer): number {
  const keywords = eventName.toLowerCase().split(/[\s,/]+/).filter((w) => w.length > 2);
  const skills = (volunteer.skills ?? []).map((s) => s.toLowerCase());
  let score = 0;
  for (const skill of skills) {
    if (keywords.some((k) => skill.includes(k) || k.includes(skill))) score += 2;
    if (eventName.toLowerCase().includes(skill)) score += 1;
  }
  return score;
}

function suggestVolunteers(eventName: string, volunteers: Volunteer[], excludeId?: string): Volunteer[] {
  return volunteers
    .filter((v) => v.id !== excludeId)
    .map((v) => ({ volunteer: v, score: scoreVolunteerMatch(eventName, v) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => x.volunteer);
}

function shiftsToRows(shifts: ReturnType<typeof useAllShifts>["data"], volunteers: Volunteer[]): VolunteerShiftRow[] {
  if (!shifts?.length) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return shifts
    .filter((s) => s.status === "Upcoming" && new Date(s.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((shift) => {
      const backups = suggestVolunteers(shift.event_name, volunteers, shift.volunteer_id);
      return {
        id: shift.id,
        event_name: shift.event_name,
        date: shift.date,
        volunteer_id: shift.volunteer_id,
        volunteerName: shift.volunteerName,
        hours: shift.hours,
        status: shift.status,
        suggestedMatchIds: backups.map((b) => b.id),
        suggestedMatchNames: backups.map((b) => b.name),
      };
    });
}

export default function VolunteerCoordinatorDetail() {
  const { data: volunteers = [], isLoading: loadingVolunteers } = useVolunteers();
  const { data: shifts = [], isLoading: loadingShifts } = useAllShifts();

  const [scanRows, setScanRows] = useState<VolunteerShiftRow[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [assignedBackups, setAssignedBackups] = useState<Record<string, string>>({});

  const dbRows = useMemo(
    () => shiftsToRows(shifts, volunteers),
    [shifts, volunteers]
  );

  const displayRows = useMemo(() => {
    if (scanRows) return scanRows;
    if (dbRows.length > 0) return dbRows;
    return buildVolunteerCoordinatorDemoRows();
  }, [scanRows, dbRows]);

  const hoursSummary = useMemo(() => {
    if (volunteers.length > 0) {
      return [...volunteers]
        .sort((a, b) => b.total_hours - a.total_hours)
        .slice(0, 8)
        .map((v) => ({
          id: v.id,
          name: v.name,
          skills: v.skills ?? [],
          total_hours: v.total_hours,
        }));
    }
    return getVolunteerHoursDemoSummary();
  }, [volunteers]);

  const volunteerCount = volunteers.length > 0 ? volunteers.length : hoursSummary.length;
  const isLoading = loadingVolunteers || loadingShifts;

  const runMatchScan = useCallback(async (): Promise<VolunteerShiftRow[]> => {
    setScanning(true);
    await simulateAgentDelay();
    const rows =
      dbRows.length > 0 ? dbRows : buildVolunteerCoordinatorDemoRows();
    setScanRows(rows);
    setScanning(false);
    return rows;
  }, [dbRows]);

  useLiveAgentDetailBootstrap({
    run: runMatchScan,
    apply: (rows) => {
      setScanRows(rows);
      toast.success("Match scan complete", {
        description: `${rows.length} upcoming shifts analyzed`,
      });
    },
  });

  const handleReminder = (volunteerName: string, eventName: string, date: string) => {
    toast.success(`Reminder sent to ${volunteerName}`, {
      description: `${eventName} on ${formatDate(date)}`,
    });
  };

  const handleSendAllReminders = async () => {
    if (displayRows.length === 0) return;
    setSendingAll(true);
    await simulateAgentDelay(900);
    setSendingAll(false);
    toast.success(`Reminders sent to ${displayRows.length} volunteers`, {
      description: "Shift confirmations queued for email and SMS",
    });
  };

  const handleAssign = (shiftId: string, backupName: string, eventName: string) => {
    setAssignedBackups((prev) => ({ ...prev, [shiftId]: backupName }));
    toast.success(`${backupName} assigned as backup`, {
      description: eventName,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-blue-500" />
            Shift coordination
          </CardTitle>
          <CardDescription>
            Matches volunteers to upcoming events by skills and availability, tracks hours, and
            sends shift reminders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading volunteer roster…
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 text-sm">
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {volunteerCount} volunteers
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                {displayRows.length} upcoming shifts
              </Badge>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                const rows = await runMatchScan();
                toast.success("Match scan complete", {
                  description: `${rows.length} shifts with skill-based backup matches`,
                });
              }}
              disabled={scanning || isLoading}
              className="gap-1.5"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run match scan
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendAllReminders}
              disabled={sendingAll || displayRows.length === 0}
              className="gap-1.5"
            >
              {sendingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send all reminders
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming shifts &amp; matches</CardTitle>
          <CardDescription>
            Skill-matched backup volunteers for each scheduled shift
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? null : displayRows.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No upcoming shifts scheduled.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Suggested match</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((shift) => {
                  const assignedBackup = assignedBackups[shift.id];
                  const primaryMatch = shift.suggestedMatchNames[0];
                  return (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium text-sm">{shift.event_name}</TableCell>
                      <TableCell className="text-sm">{formatDate(shift.date)}</TableCell>
                      <TableCell className="text-sm">
                        {shift.volunteerName}
                        {assignedBackup && (
                          <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                            + backup: {assignedBackup}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {shift.suggestedMatchNames.length > 0
                          ? shift.suggestedMatchNames.join(", ")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {primaryMatch && !assignedBackup && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 text-xs gap-1"
                              onClick={() =>
                                handleAssign(shift.id, primaryMatch, shift.event_name)
                              }
                            >
                              <UserPlus className="h-3 w-3" />
                              Assign
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() =>
                              handleReminder(shift.volunteerName, shift.event_name, shift.date)
                            }
                          >
                            <Mail className="h-3 w-3" />
                            Remind
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hours tracked
          </CardTitle>
          <CardDescription>Top volunteers by total hours logged</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead className="text-right">Total hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hoursSummary.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-sm">{v.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {v.skills.slice(0, 3).join(" · ") || "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">{v.total_hours} hrs</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link to="/volunteers">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Open Volunteers module
          </Link>
        </Button>
      </div>
    </div>
  );
}
