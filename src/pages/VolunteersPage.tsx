/**
 * Volunteer Management — /volunteers
 *
 * Volunteer profiles, shift tracking, and hour logging.
 * All data is demo data — no Supabase queries.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Users, Clock, DollarSign, Heart, Search, Calendar, CheckCircle2, Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DEMO_VOLUNTEERS, DEMO_VOLUNTEER_STATS,
  type DemoVolunteer, type ShiftStatus,
} from "@/shared/data/nonprofitDemoData";

// ── Helpers ──────────────────────────────────────────────────────

function shiftStatusColor(status: ShiftStatus): string {
  const map: Record<ShiftStatus, string> = {
    Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status];
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

// ── Form schema ───────────────────────────────────────────────────

const volunteerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});
type VolunteerForm = z.infer<typeof volunteerSchema>;

// ── Component ─────────────────────────────────────────────────────

export default function VolunteersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<DemoVolunteer | null>(null);

  const form = useForm<VolunteerForm>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: { name: "", email: "" },
  });

  const filteredVolunteers = DEMO_VOLUNTEERS.filter((v) =>
    searchQuery === "" ||
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Flatten all shifts for the Shifts tab
  const allShifts = DEMO_VOLUNTEERS.flatMap((v) =>
    v.shifts.map((s) => ({ ...s, volunteerName: v.name }))
  ).sort((a, b) => (a.date < b.date ? -1 : 1));

  const economicValue = (DEMO_VOLUNTEER_STATS.totalHoursAllTime * DEMO_VOLUNTEER_STATS.dollarValuePerHour).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const kpiCards = [
    { label: "Total Volunteers", value: DEMO_VOLUNTEER_STATS.totalVolunteers, icon: Users, color: "text-blue-600", suffix: "" },
    { label: "Active This Month", value: DEMO_VOLUNTEER_STATS.activeThisMonth, icon: CheckCircle2, color: "text-green-600", suffix: "" },
    { label: "Total Hours", value: DEMO_VOLUNTEER_STATS.totalHoursAllTime.toLocaleString(), icon: Clock, color: "text-purple-600", suffix: " hrs" },
    { label: "Economic Value", value: economicValue, icon: DollarSign, color: "text-amber-600", suffix: "" },
  ];

  const onSubmit = (data: VolunteerForm) => {
    toast.success(`Volunteer ${data.name} added`, {
      description: `Welcome email will be sent to ${data.email}.`,
    });
    form.reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Volunteer Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track volunteers, manage shifts, and measure community impact
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground truncate">{card.label}</p>
                  <p className="text-2xl font-bold mt-1 truncate">
                    {card.value}{card.suffix}
                  </p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color} opacity-80 shrink-0`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="volunteers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="add">Add Volunteer</TabsTrigger>
        </TabsList>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, skill, or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVolunteers.map((volunteer) => (
              <Card key={volunteer.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedVolunteer(volunteer)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {getInitials(volunteer.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-semibold text-sm truncate">{volunteer.name}</p>
                        {volunteer.isAlsoDonor && (
                          <Heart className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" aria-label="Also a donor" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {volunteer.totalHours} hrs total
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {volunteer.skills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                        {volunteer.skills.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{volunteer.skills.length - 2}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {volunteer.availability.slice(0, 2).map((slot) => (
                          <span key={slot} className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="h-3 w-3" /> {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredVolunteers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No volunteers match your search</p>
          )}
        </TabsContent>

        {/* Shifts Tab */}
        <TabsContent value="shifts">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="text-sm font-medium">{shift.volunteerName}</TableCell>
                      <TableCell className="text-sm">{shift.eventName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{shift.date}</TableCell>
                      <TableCell className="text-sm">{shift.hours}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${shiftStatusColor(shift.status)}`}>
                          {shift.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Volunteer Tab */}
        <TabsContent value="add">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle className="text-base">Register New Volunteer</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vol-name">Full Name</Label>
                  <Input id="vol-name" placeholder="Jane Smith" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vol-email">Email Address</Label>
                  <Input id="vol-email" type="email" placeholder="jane@example.com" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  <Users className="h-4 w-4 mr-2" /> Register Volunteer
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Volunteer Detail Sheet */}
      <Sheet open={!!selectedVolunteer} onOpenChange={(open) => !open && setSelectedVolunteer(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedVolunteer && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {getInitials(selectedVolunteer.name)}
                  </div>
                  <div>
                    <SheetTitle>{selectedVolunteer.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedVolunteer.email}</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Hours stat */}
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-4xl font-bold text-primary">{selectedVolunteer.totalHours}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Hours Volunteered</p>
                  <p className="text-xs text-muted-foreground">
                    ≈ {(selectedVolunteer.totalHours * DEMO_VOLUNTEER_STATS.dollarValuePerHour).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} economic value
                  </p>
                </div>

                {/* Donor crossover */}
                {selectedVolunteer.isAlsoDonor && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="text-sm text-amber-700 dark:text-amber-400">
                      Also a donor — lifetime giving:{" "}
                      {(selectedVolunteer.donorTotalGiving ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                    </span>
                  </div>
                )}

                {/* Skills */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5" /> Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVolunteer.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Availability
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVolunteer.availability.map((slot) => (
                      <Badge key={slot} variant="outline">{slot}</Badge>
                    ))}
                  </div>
                </div>

                {/* Shift history */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Shifts</h4>
                  <div className="space-y-2">
                    {selectedVolunteer.shifts.map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{shift.eventName}</p>
                          <p className="text-xs text-muted-foreground">{shift.date} · {shift.hours} hrs</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ml-2 ${shiftStatusColor(shift.status)}`}>
                          {shift.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <Button
                  className="w-full"
                  onClick={() => toast.success(`Shift invitation sent to ${selectedVolunteer.name}`)}
                >
                  <Calendar className="h-4 w-4 mr-2" /> Invite to Shift
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
