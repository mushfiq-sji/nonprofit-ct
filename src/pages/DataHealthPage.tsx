import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, X, Eye, Flag, Archive, Loader2, Users, AlertTriangle, ChevronDown } from "lucide-react";
import { toast } from "sonner";

// ── Types ──
interface DuplicateRecord {
  email: string;
  phone: string;
  lastGift: string;
  lastGiftDate: string;
  created: string;
}

interface DuplicatePair {
  id: string;
  name: string;
  idA: string;
  idB: string;
  confidence: number;
  recordA: DuplicateRecord;
  recordB: DuplicateRecord;
}

interface IncompleteProfile {
  id: string;
  name: string;
  missingFields: string[];
  lastUpdated: string;
}

interface StaleRecord {
  id: string;
  name: string;
  lastActivity: string;
  lastGift: string;
}

// ── Data ──
const INITIAL_DUPLICATES: DuplicatePair[] = [
  {
    id: "d1", name: "Sarah Chen", idA: "#1847", idB: "#2103", confidence: 94,
    recordA: { email: "sarah.chen@gmail.com", phone: "617-555-0142", lastGift: "$500", lastGiftDate: "Mar 2026", created: "Jan 2024" },
    recordB: { email: "sarah.chen@gmail.com", phone: "617-555-0198", lastGift: "$250", lastGiftDate: "Nov 2025", created: "Mar 2025" },
  },
  {
    id: "d2", name: "Michael Torres", idA: "#892", idB: "#1654", confidence: 87,
    recordA: { email: "mike.torres@outlook.com", phone: "781-555-0367", lastGift: "$1,200", lastGiftDate: "Feb 2026", created: "Aug 2022" },
    recordB: { email: "michael.torres@outlook.com", phone: "781-555-0367", lastGift: "$750", lastGiftDate: "Jan 2026", created: "May 2024" },
  },
  {
    id: "d3", name: "Jennifer Walsh", idA: "#3021", idB: "#3089", confidence: 99,
    recordA: { email: "jwalsh@comcast.net", phone: "508-555-0291", lastGift: "$2,500", lastGiftDate: "Apr 2026", created: "Apr 7, 2026 9:14am" },
    recordB: { email: "jwalsh@comcast.net", phone: "508-555-0291", lastGift: "$2,500", lastGiftDate: "Apr 2026", created: "Apr 7, 2026 9:16am" },
  },
];

const INITIAL_INCOMPLETE: IncompleteProfile[] = [
  { id: "ip1", name: "Robert Kim", missingFields: ["Phone", "Address"], lastUpdated: "14 months ago" },
  { id: "ip2", name: "Patricia Osei", missingFields: ["Phone"], lastUpdated: "8 months ago" },
  { id: "ip3", name: "David Chen", missingFields: ["Address", "Birthdate"], lastUpdated: "2 years ago" },
  { id: "ip4", name: "Susan Park", missingFields: ["Employment"], lastUpdated: "6 months ago" },
  { id: "ip5", name: "Thomas Rivera", missingFields: ["Phone", "Address"], lastUpdated: "3 years ago" },
  { id: "ip6", name: "Angela Davis", missingFields: ["Email"], lastUpdated: "4 months ago" },
  { id: "ip7", name: "Mark Johnson", missingFields: ["Phone", "Birthdate"], lastUpdated: "11 months ago" },
  { id: "ip8", name: "Helen Brooks", missingFields: ["Address"], lastUpdated: "7 months ago" },
];

const INITIAL_STALE: StaleRecord[] = [
  { id: "s1", name: "Margaret Liu", lastActivity: "22 months ago", lastGift: "$150" },
  { id: "s2", name: "William Park", lastActivity: "31 months ago", lastGift: "$75" },
  { id: "s3", name: "Helen Brooks", lastActivity: "19 months ago", lastGift: "$500" },
  { id: "s4", name: "James Okafor", lastActivity: "26 months ago", lastGift: "$200" },
];

// ── Field diff highlight helper ──
function FieldCell({ a, b, value }: { a: string; b: string; value: string }) {
  const differs = a !== b;
  return (
    <span className={differs ? "bg-amber-100 dark:bg-amber-900/30 px-1 rounded" : ""}>
      {value}
    </span>
  );
}

export default function DataHealthPage() {
  const [duplicates, setDuplicates] = useState(INITIAL_DUPLICATES);
  const [incomplete, setIncomplete] = useState(INITIAL_INCOMPLETE);
  const [stale, setStale] = useState(INITIAL_STALE);
  const [score, setScore] = useState(82);
  const [showMoreDups, setShowMoreDups] = useState(false);
  const [showMoreIncomplete, setShowMoreIncomplete] = useState(false);
  const [drawerPair, setDrawerPair] = useState<DuplicatePair | null>(null);
  const [completeModal, setCompleteModal] = useState<IncompleteProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  const handleMerge = (id: string, name: string) => {
    setDuplicates((prev) => prev.filter((d) => d.id !== id));
    setScore((s) => Math.min(100, s + 1));
    toast.success(`✓ Records merged — ${name} consolidated in Salesforce`);
  };

  const handleMarkDifferent = (id: string) => {
    setDuplicates((prev) => prev.filter((d) => d.id !== id));
    toast("Marked as distinct records", { icon: "✓" });
  };

  const handleCompleteProfile = (profile: IncompleteProfile) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setIncomplete((prev) => prev.filter((p) => p.id !== profile.id));
      setCompleteModal(null);
      setScore((s) => Math.min(100, s + 1));
      toast.success(`✓ Profile updated for ${profile.name} — synced to Salesforce`);
    }, 1500);
  };

  const handleFlagOutreach = (id: string) => {
    setFlagged((prev) => new Set(prev).add(id));
    toast.success("Flagged for outreach — assigned to Development team");
  };

  const handleArchive = (id: string) => {
    setStale((prev) => prev.filter((s) => s.id !== id));
    toast("Record archived", { icon: "✓" });
  };

  const visibleDuplicates = showMoreDups ? duplicates : duplicates.slice(0, 3);
  const visibleIncomplete = showMoreIncomplete ? incomplete : incomplete.slice(0, 5);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Health</h1>
        <p className="text-sm text-muted-foreground">
          Brightside Foundation · Synced from Salesforce · 47 min ago
        </p>
      </div>

      {/* Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30 border-4 border-green-200">
              <span className="text-4xl font-bold text-green-600">{score}%</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Data Health Score</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Based on duplicate detection, profile completeness, and data consistency checks.
              </p>
              <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${score}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Duplicates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Duplicate Records
          </CardTitle>
          <CardDescription>{duplicates.length} total — review and merge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {duplicates.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-semibold">All clear — no duplicates found</p>
            </div>
          ) : (
            <>
              {visibleDuplicates.map((dup) => (
                <div key={dup.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{dup.name}</p>
                      <p className="text-sm text-muted-foreground">Record {dup.idA} vs {dup.idB}</p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">{dup.confidence}% match</Badge>
                  </div>
                  {/* Side by side */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                      <p className="font-semibold text-muted-foreground mb-2">Record {dup.idA}</p>
                      <p><FieldCell a={dup.recordA.email} b={dup.recordB.email} value={dup.recordA.email} /></p>
                      <p><FieldCell a={dup.recordA.phone} b={dup.recordB.phone} value={dup.recordA.phone} /></p>
                      <p>Last gift: {dup.recordA.lastGift} ({dup.recordA.lastGiftDate})</p>
                      <p><FieldCell a={dup.recordA.created} b={dup.recordB.created} value={`Created ${dup.recordA.created}`} /></p>
                    </div>
                    <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                      <p className="font-semibold text-muted-foreground mb-2">Record {dup.idB}</p>
                      <p><FieldCell a={dup.recordA.email} b={dup.recordB.email} value={dup.recordB.email} /></p>
                      <p><FieldCell a={dup.recordA.phone} b={dup.recordB.phone} value={dup.recordB.phone} /></p>
                      <p>Last gift: {dup.recordB.lastGift} ({dup.recordB.lastGiftDate})</p>
                      <p><FieldCell a={dup.recordA.created} b={dup.recordB.created} value={`Created ${dup.recordB.created}`} /></p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="gap-1.5" onClick={() => handleMerge(dup.id, dup.name)}>
                      <CheckCircle className="h-3.5 w-3.5" /> Approve Merge
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleMarkDifferent(dup.id)}>
                      <X className="h-3.5 w-3.5" /> Mark as Different
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setDrawerPair(dup)}>
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </Button>
                  </div>
                </div>
              ))}
              {!showMoreDups && duplicates.length > 3 && (
                <Button variant="outline" className="w-full gap-1.5" onClick={() => setShowMoreDups(true)}>
                  <ChevronDown className="h-4 w-4" /> Show {duplicates.length - 3} more duplicates
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Incomplete Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Incomplete Profiles
          </CardTitle>
          <CardDescription>{incomplete.length} records need attention</CardDescription>
        </CardHeader>
        <CardContent>
          {incomplete.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-semibold">All profiles complete</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Donor Name</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Missing Fields</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Updated</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleIncomplete.map((p) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.missingFields.join(", ")}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.lastUpdated}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => setCompleteModal(p)}>
                            Complete Profile
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!showMoreIncomplete && incomplete.length > 5 && (
                <Button variant="outline" className="w-full mt-3 gap-1.5" onClick={() => setShowMoreIncomplete(true)}>
                  <ChevronDown className="h-4 w-4" /> Show {incomplete.length - 5} more
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Stale Records */}
      <Card>
        <CardHeader>
          <CardTitle>Stale Records</CardTitle>
          <CardDescription>No activity in 18+ months</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stale.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-semibold">All clear — no stale records</p>
            </div>
          ) : (
            stale.map((rec) => (
              <div key={rec.id} className={`rounded-lg border p-4 flex items-center justify-between ${flagged.has(rec.id) ? "border-blue-300 bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
                <div>
                  <p className="font-medium">{rec.name}</p>
                  <p className="text-xs text-muted-foreground">Last activity: {rec.lastActivity} · Last gift: {rec.lastGift}</p>
                </div>
                <div className="flex gap-2">
                  {flagged.has(rec.id) ? (
                    <Badge variant="outline" className="text-blue-600 border-blue-300">Flagged ✓</Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleFlagOutreach(rec.id)}>
                      <Flag className="h-3.5 w-3.5" /> Flag for Outreach
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={() => handleArchive(rec.id)}>
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Drawer: Duplicate Details */}
      <Sheet open={!!drawerPair} onOpenChange={() => setDrawerPair(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {drawerPair && (
            <>
              <SheetHeader>
                <SheetTitle>{drawerPair.name} — Record Comparison</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: `Record ${drawerPair.idA}`, rec: drawerPair.recordA }, { label: `Record ${drawerPair.idB}`, rec: drawerPair.recordB }].map(({ label, rec }) => (
                    <div key={label} className="rounded-lg border p-4 space-y-2 text-sm">
                      <p className="font-semibold text-muted-foreground">{label}</p>
                      <p><span className="text-muted-foreground">Email:</span> {rec.email}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {rec.phone}</p>
                      <p><span className="text-muted-foreground">Last Gift:</span> {rec.lastGift} ({rec.lastGiftDate})</p>
                      <p><span className="text-muted-foreground">Created:</span> {rec.created}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={() => { handleMerge(drawerPair.id, drawerPair.name); setDrawerPair(null); }}>
                    Keep {drawerPair.idA} — Primary
                  </Button>
                  <Button className="flex-1" variant="secondary" onClick={() => { handleMerge(drawerPair.id, drawerPair.name); setDrawerPair(null); }}>
                    Keep {drawerPair.idB} — Primary
                  </Button>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setDrawerPair(null)}>Cancel</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal: Complete Profile */}
      <Dialog open={!!completeModal} onOpenChange={() => setCompleteModal(null)}>
        <DialogContent>
          {completeModal && (
            <>
              <DialogHeader>
                <DialogTitle>Complete Profile — {completeModal.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {completeModal.missingFields.map((field) => (
                  <div key={field} className="space-y-2">
                    <Label>{field}</Label>
                    <Input placeholder={`Enter ${field.toLowerCase()}`} className="border-amber-300 focus:border-amber-500" />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCompleteModal(null)}>Cancel</Button>
                <Button onClick={() => handleCompleteProfile(completeModal)} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {saving ? "Saving…" : "Save to Salesforce"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
