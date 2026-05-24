/**
 * Event Management — /event-management
 *
 * Full event lifecycle management: create events, manage registrations,
 * track capacity, view agendas and speakers.
 *
 * NOTE: This is separate from /events (post-event intelligence). Do not modify EventsPage.tsx.
 * All data is demo data — no Supabase queries.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CalendarPlus, Calendar, MapPin, Users, Ticket, Plus, Eye, ClipboardList, CheckCircle2, DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DEMO_MANAGED_EVENTS,
  type DemoManagedEvent, type ManagedEventStatus,
} from "@/shared/data/nonprofitDemoData";

// ── Helpers ──────────────────────────────────────────────────────

function statusColor(status: ManagedEventStatus): string {
  const map: Record<ManagedEventStatus, string> = {
    Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    Active: "bg-green-100 text-green-700 border-green-200",
    Past: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return map[status];
}

// ── Form schema ───────────────────────────────────────────────────

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(3, "Location is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),
});
type EventForm = z.infer<typeof eventSchema>;

// ── Component ─────────────────────────────────────────────────────

export default function EventManagementPage() {
  const [statusFilter, setStatusFilter] = useState<ManagedEventStatus | "All">("All");
  const [detailEvent, setDetailEvent] = useState<DemoManagedEvent | null>(null);
  const [registrationsEvent, setRegistrationsEvent] = useState<DemoManagedEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: "", date: "", location: "", capacity: 100, description: "" },
  });

  const filteredEvents = DEMO_MANAGED_EVENTS.filter(
    (e) => statusFilter === "All" || e.status === statusFilter
  );

  const onCreateSubmit = (data: EventForm) => {
    toast.success(`Event "${data.title}" created`, {
      description: `Scheduled for ${data.date} at ${data.location}. Capacity: ${data.capacity}.`,
    });
    setCreateOpen(false);
    form.reset();
  };

  const statusFilters: Array<ManagedEventStatus | "All"> = ["All", "Upcoming", "Active", "Past"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarPlus className="h-6 w-6 text-primary" />
            Event Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your full event lifecycle
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Event
        </Button>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={statusFilter === filter ? "default" : "outline"}
            onClick={() => setStatusFilter(filter)}
          >
            {filter}
            {filter !== "All" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({DEMO_MANAGED_EVENTS.filter((e) => e.status === filter).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Event list */}
      <div className="space-y-4">
        {filteredEvents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No events in this category</p>
        )}
        {filteredEvents.map((event) => {
          const capacityPct = Math.round((event.registrationCount / event.capacity) * 100);
          return (
            <Card key={event.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{event.title}</h3>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {event.location}
                      </span>
                    </div>

                    {/* Capacity bar */}
                    <div className="mt-3 max-w-xs">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.registrationCount} / {event.capacity} registered
                        </span>
                        <span>{capacityPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${capacityPct >= 90 ? "bg-red-500" : capacityPct >= 70 ? "bg-amber-500" : "bg-primary"}`}
                          style={{ width: `${Math.min(100, capacityPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Ticket summary */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {event.ticketTypes.map((tt) => (
                        <span key={tt.tier} className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Ticket className="h-3 w-3" />
                          {tt.tier}: {tt.sold} sold
                        </span>
                      ))}
                    </div>

                    {event.fundRaised !== undefined && (
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium mt-2 flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {event.fundRaised.toLocaleString()} raised
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 sm:flex-col shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailEvent(event)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRegistrationsEvent(event)}
                    >
                      <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Registrations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Event Detail Sheet */}
      <Sheet open={!!detailEvent} onOpenChange={(open) => !open && setDetailEvent(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {detailEvent && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <SheetTitle>{detailEvent.title}</SheetTitle>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(detailEvent.status)}`}>
                    {detailEvent.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {detailEvent.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {detailEvent.location}
                  </span>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <p className="text-sm text-muted-foreground">{detailEvent.description}</p>

                {detailEvent.fundRaised !== undefined && (
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-3">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {detailEvent.fundRaised.toLocaleString()} raised at this event
                    </p>
                  </div>
                )}

                {/* Speakers */}
                {detailEvent.speakers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Speakers</h4>
                    <div className="space-y-2">
                      {detailEvent.speakers.map((speaker) => (
                        <div key={speaker.name} className="flex items-center gap-2 text-sm">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                            {speaker.name[0]}
                          </div>
                          <div>
                            <p className="font-medium">{speaker.name}</p>
                            <p className="text-xs text-muted-foreground">{speaker.title}, {speaker.organization}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agenda */}
                {detailEvent.agenda.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Agenda</h4>
                    <div className="space-y-1">
                      {detailEvent.agenda.map((item) => (
                        <div key={item.time} className="flex gap-3 text-sm py-1.5 border-b last:border-0">
                          <span className="text-muted-foreground w-20 shrink-0">{item.time}</span>
                          <div>
                            <span>{item.title}</span>
                            {item.speaker && <span className="text-xs text-muted-foreground ml-1.5">— {item.speaker}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ticket Types */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ticket Types</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Tier</TableHead>
                        <TableHead className="text-xs">Price</TableHead>
                        <TableHead className="text-xs">Capacity</TableHead>
                        <TableHead className="text-xs">Sold</TableHead>
                        <TableHead className="text-xs">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailEvent.ticketTypes.map((tt) => (
                        <TableRow key={tt.tier}>
                          <TableCell className="text-xs font-medium">{tt.tier}</TableCell>
                          <TableCell className="text-xs">{tt.price === 0 ? "Free" : `$${tt.price}`}</TableCell>
                          <TableCell className="text-xs">{tt.capacity}</TableCell>
                          <TableCell className="text-xs">{tt.sold}</TableCell>
                          <TableCell className="text-xs">{tt.price === 0 ? "—" : `$${(tt.price * tt.sold).toLocaleString()}`}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Registrations Sheet */}
      <Sheet open={!!registrationsEvent} onOpenChange={(open) => !open && setRegistrationsEvent(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {registrationsEvent && (
            <>
              <SheetHeader>
                <SheetTitle>{registrationsEvent.title}</SheetTitle>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {registrationsEvent.registrationCount} / {registrationsEvent.capacity}
                  </span>
                  {registrationsEvent.status === "Past" && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      {registrationsEvent.registrants.filter((r) => r.checkedIn).length} checked in
                    </span>
                  )}
                </div>
              </SheetHeader>

              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Ticket</TableHead>
                      <TableHead className="text-xs">Registered</TableHead>
                      <TableHead className="text-xs">Check-In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrationsEvent.registrants.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <p className="text-xs font-medium">{reg.name}</p>
                          <p className="text-xs text-muted-foreground">{reg.email}</p>
                        </TableCell>
                        <TableCell className="text-xs">{reg.ticketTier}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{reg.registeredDate}</TableCell>
                        <TableCell>
                          {reg.checkedIn ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs px-2"
                              onClick={() => toast.success(`${reg.name} checked in`)}
                            >
                              Check In
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Showing {registrationsEvent.registrants.length} of {registrationsEvent.registrationCount} total registrants
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">Event Title</Label>
              <Input id="ev-title" placeholder="Annual Fundraising Gala" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-date">Date</Label>
              <Input id="ev-date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-location">Location</Label>
              <Input id="ev-location" placeholder="Venue name or address" {...form.register("location")} />
              {form.formState.errors.location && (
                <p className="text-xs text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-capacity">Capacity</Label>
              <Input id="ev-capacity" type="number" min={1} {...form.register("capacity")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-desc">Description (optional)</Label>
              <Textarea id="ev-desc" placeholder="Describe your event…" rows={3} {...form.register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit">
                <CalendarPlus className="h-4 w-4 mr-2" /> Create Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
