import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Users, CheckCircle, Loader2, Send, Tag } from "lucide-react";
import { toast } from "sonner";

interface Attendee {
  id: string;
  name: string;
  type: string;
  thanked: boolean;
  tagged: boolean;
}

const INITIAL_ATTENDEES: Attendee[] = [
  { id: "a1", name: "Sarah Mitchell", type: "Existing Donor", thanked: true, tagged: true },
  { id: "a2", name: "Robert Kim", type: "Prospect", thanked: false, tagged: false },
  { id: "a3", name: "Patricia Lee", type: "New Contact", thanked: false, tagged: false },
  { id: "a4", name: "David Osei", type: "Existing Donor", thanked: true, tagged: true },
  { id: "a5", name: "Jennifer Walsh", type: "Prospect", thanked: false, tagged: false },
  { id: "a6", name: "Mark Abrams", type: "New Contact", thanked: false, tagged: false },
  { id: "a7", name: "Lisa Chen", type: "Prospect", thanked: false, tagged: false },
  { id: "a8", name: "Thomas Rivera", type: "Existing Donor", thanked: true, tagged: true },
  { id: "a9", name: "Carol Nguyen", type: "New Contact", thanked: false, tagged: false },
  { id: "a10", name: "James Wright", type: "Prospect", thanked: false, tagged: false },
];

export default function EventsPage() {
  const [attendees, setAttendees] = useState(INITIAL_ATTENDEES);
  const [attendeeDrawer, setAttendeeDrawer] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [taskUpgrade, setTaskUpgrade] = useState(true);
  const [taskVolunteer, setTaskVolunteer] = useState(true);
  const [taskGeneral, setTaskGeneral] = useState(false);

  const unactioned = attendees.filter((a) => !a.thanked || !a.tagged).length;

  const handleThankTag = (id: string) => {
    setAttendees((prev) =>
      prev.map((a) => a.id === id ? { ...a, thanked: true, tagged: true } : a)
    );
  };

  const handleTagAll = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setAttendees((prev) => prev.map((a) => ({ ...a, thanked: true, tagged: true })));
      toast.success(`✓ ${unactioned} attendees tagged and thank you emails queued`);
    }, 2000);
  };

  const handleSendEmails = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setEmailModal(false);
      toast.success("✓ 47 thank you emails sent via Mailchimp");
    }, 1500);
  };

  const handleTagSalesforce = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("✓ 47 attendees tagged in Salesforce — 12 flagged as volunteer prospects");
    }, 2000);
  };

  const handleCreateTasks = () => {
    const count = (taskUpgrade ? 8 : 0) + (taskVolunteer ? 12 : 0) + (taskGeneral ? 47 : 0);
    setTaskModal(false);
    toast.success(`✓ ${count} follow-up tasks created and assigned`);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">Brightside Foundation · Post-event engagement intelligence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Attendees (YTD)", value: "281" },
          { label: "Events This Quarter", value: "2" },
          { label: "Donors Acquired", value: "21" },
          { label: "Follow-ups Pending", value: "47" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event 1: Spring Gala */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Spring Gala 2026</h3>
                <p className="text-sm text-muted-foreground">April 3, 2026 · The Boston Marriott Copley Place</p>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">FOLLOW-UP NEEDED</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>247 attendees (187 existing donors, 42 prospects, 18 new contacts) · Revenue: $142,000</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">47 not thanked</Badge>
            <Badge variant="secondary">12 volunteer interest</Badge>
            <Badge variant="secondary">8 upgrade prospects</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setAttendeeDrawer(true)}>
              <Users className="h-3.5 w-3.5 mr-1.5" /> View Attendees
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEmailModal(true)}>
              <Send className="h-3.5 w-3.5 mr-1.5" /> Send Thank You Emails
            </Button>
            <Button size="sm" variant="outline" onClick={handleTagSalesforce} disabled={sending}>
              {sending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Tag className="h-3.5 w-3.5 mr-1.5" />}
              Tag All in Salesforce
            </Button>
            <Button size="sm" variant="outline" onClick={() => setTaskModal(true)}>
              Create Follow-Up Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event 2: Volunteer Orientation */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                <CalendarDays className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Volunteer Orientation</h3>
                <p className="text-sm text-muted-foreground">March 15, 2026 · Brightside Foundation HQ — 120 Tremont St, Boston</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">COMPLETE</Badge>
          </div>
          <p className="text-sm text-muted-foreground">34 attendees · 28 new volunteers · 3 donors converted</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.info("Opening attendee list…")}>View Attendees</Button>
            <Button size="sm" variant="outline" onClick={() => toast.info("Summary report generated")}>View Summary Report</Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendee Drawer */}
      <Sheet open={attendeeDrawer} onOpenChange={setAttendeeDrawer}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Spring Gala Attendees</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-3 mb-4 text-sm">
              {attendees.filter((a) => !a.thanked || !a.tagged).length} attendees still need action
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-center py-2 px-2">Thanked</th>
                  <th className="text-center py-2 px-2">Tagged</th>
                  <th className="text-right py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium">{a.name}</td>
                    <td className="py-2 px-2 text-muted-foreground">{a.type}</td>
                    <td className="py-2 px-2 text-center">{a.thanked ? "✓" : "✗"}</td>
                    <td className="py-2 px-2 text-center">{a.tagged ? "✓" : "✗"}</td>
                    <td className="py-2 px-2 text-right">
                      {!a.thanked || !a.tagged ? (
                        <Button size="sm" variant="outline" onClick={() => handleThankTag(a.id)}>Thank + Tag</Button>
                      ) : (
                        <span className="text-green-600 text-xs">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button className="w-full mt-4" onClick={handleTagAll} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Tag All Remaining
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Email Modal */}
      <Dialog open={emailModal} onOpenChange={setEmailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Thank You Emails</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm">
              <p className="font-medium">Subject: Thank you for attending the Spring Gala, [First Name]!</p>
              <p className="text-muted-foreground mt-2">
                We're grateful you joined us at the Spring Gala. Your support makes a real difference in our community programs. We look forward to seeing you at future events.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Recipients: 47 attendees</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModal(false)}>Cancel</Button>
            <Button onClick={handleSendEmails} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Creation Modal */}
      <Dialog open={taskModal} onOpenChange={setTaskModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Follow-Up Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Create individual tasks for:</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={taskUpgrade} onCheckedChange={(v) => setTaskUpgrade(!!v)} />
                8 mid-level upgrade prospects (assign to: Maria Santos)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={taskVolunteer} onCheckedChange={(v) => setTaskVolunteer(!!v)} />
                12 volunteer interest flags (assign to: Kevin Park)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={taskGeneral} onCheckedChange={(v) => setTaskGeneral(!!v)} />
                47 general thank you follow-ups (assign to: Lisa Chen)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskModal(false)}>Cancel</Button>
            <Button onClick={handleCreateTasks}>Create Tasks</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
