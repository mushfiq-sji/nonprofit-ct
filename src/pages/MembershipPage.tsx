/**
 * Membership Management — /membership
 *
 * Member directory, renewals tracking, and member onboarding.
 * All data is demo data — no Supabase queries.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Users, UserCheck, UserX, Clock, Search, Mail, RefreshCw, Phone, Building2,
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DEMO_MEMBERS, DEMO_MEMBERSHIP_STATS,
  type DemoMember, type MemberTier, type MemberStatus,
} from "@/shared/data/nonprofitDemoData";

// ── Helpers ──────────────────────────────────────────────────────

function tierBadgeVariant(tier: MemberTier): string {
  const map: Record<MemberTier, string> = {
    General: "bg-gray-100 text-gray-700 border-gray-200",
    Professional: "bg-blue-100 text-blue-700 border-blue-200",
    Board: "bg-purple-100 text-purple-700 border-purple-200",
    Honorary: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return map[tier];
}

function statusBadgeVariant(status: MemberStatus): string {
  const map: Record<MemberStatus, string> = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Expiring: "bg-amber-100 text-amber-700 border-amber-200",
    Lapsed: "bg-red-100 text-red-700 border-red-200",
    Pending: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return map[status];
}

// ── Form schema ───────────────────────────────────────────────────

const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  tier: z.enum(["General", "Professional", "Board", "Honorary"] as const),
});
type MemberForm = z.infer<typeof memberSchema>;

// ── Component ─────────────────────────────────────────────────────

export default function MembershipPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<MemberTier | "All">("All");
  const [selectedMember, setSelectedMember] = useState<DemoMember | null>(null);

  const form = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: "", email: "", tier: "General" },
  });

  // Destructure once to avoid multiple watch() subscriptions causing excessive re-renders
  const { tier: watchedTier } = form.watch();

  const filteredMembers = DEMO_MEMBERS.filter((m) => {
    const matchesSearch =
      searchQuery === "" ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.employer ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "All" || m.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const expiringMembers = DEMO_MEMBERS.filter((m) => m.status === "Expiring");
  const lapsedMembers = DEMO_MEMBERS.filter((m) => m.status === "Lapsed");

  const onSubmit = (data: MemberForm) => {
    console.log("New member:", data);
    toast.success(`Member ${data.name} added`, {
      description: `${data.tier} membership created. Welcome email will be sent to ${data.email}.`,
    });
    form.reset();
  };

  const kpiCards = [
    { label: "Total Members", value: DEMO_MEMBERSHIP_STATS.totalMembers, icon: Users, color: "text-blue-600" },
    { label: "Active", value: DEMO_MEMBERSHIP_STATS.activeMembers, icon: UserCheck, color: "text-green-600" },
    { label: "Expiring Soon", value: DEMO_MEMBERSHIP_STATS.expiringMembers, icon: Clock, color: "text-amber-600" },
    { label: "Lapsed", value: DEMO_MEMBERSHIP_STATS.lapsedMembers, icon: UserX, color: "text-red-600" },
  ];

  const tierFilters: Array<MemberTier | "All"> = ["All", "General", "Professional", "Board", "Honorary"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Membership Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track members, manage renewals, and grow your membership base
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="renewals">
            Renewals
            {(expiringMembers.length + lapsedMembers.length) > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 text-white text-xs px-1.5 py-0.5">
                {expiringMembers.length + lapsedMembers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="add">Add Member</TabsTrigger>
        </TabsList>

        {/* Directory Tab */}
        <TabsContent value="directory" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or employer…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {tierFilters.map((tier) => (
                <Button
                  key={tier}
                  size="sm"
                  variant={tierFilter === tier ? "default" : "outline"}
                  onClick={() => setTierFilter(tier)}
                >
                  {tier}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead className="hidden md:table-cell">Renewal Date</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No members match your search
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedMember(member)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tierBadgeVariant(member.tier)}`}>
                            {member.tier}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeVariant(member.status)}`}>
                            {member.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {member.joinDate}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {member.renewalDate}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Showing {filteredMembers.length} of {DEMO_MEMBERS.length} members
          </p>
        </TabsContent>

        {/* Renewals Tab */}
        <TabsContent value="renewals" className="space-y-6">
          {/* Expiring */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-sm">Expiring Within 30 Days ({expiringMembers.length})</h3>
            </div>
            {expiringMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expiring memberships</p>
            ) : (
              <div className="space-y-2">
                {expiringMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email} · Renewal: {member.renewalDate}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tierBadgeVariant(member.tier)}`}>
                            {member.tier}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.success(`Renewal reminder sent to ${member.name}`, { description: `Email sent to ${member.email}` })}
                          >
                            <Mail className="h-3.5 w-3.5 mr-1.5" /> Send Reminder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Lapsed */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              <h3 className="font-semibold text-sm">Lapsed Members ({lapsedMembers.length})</h3>
            </div>
            {lapsedMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lapsed memberships</p>
            ) : (
              <div className="space-y-2">
                {lapsedMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email} · Expired: {member.renewalDate}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tierBadgeVariant(member.tier)}`}>
                            {member.tier}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => toast.success(`Re-engagement email sent to ${member.name}`, { description: `Renewal offer sent to ${member.email}` })}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Re-Engage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Add Member Tab */}
        <TabsContent value="add">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle className="text-base">New Member Application</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Jane Smith" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="jane@example.com" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tier">Membership Tier</Label>
                  <Select
                    value={watchedTier}
                    onValueChange={(val) => form.setValue("tier", val as MemberTier)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Board">Board</SelectItem>
                      <SelectItem value="Honorary">Honorary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  <Users className="h-4 w-4 mr-2" /> Add Member
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Detail Sheet */}
      <Sheet open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <SheetContent className="sm:max-w-md">
          {selectedMember && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedMember.name}</SheetTitle>
                <div className="flex gap-2 mt-1">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tierBadgeVariant(selectedMember.tier)}`}>
                    {selectedMember.tier}
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeVariant(selectedMember.status)}`}>
                    {selectedMember.status}
                  </span>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Contact info */}
                <div className="space-y-2.5">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{selectedMember.email}</span>
                  </div>
                  {selectedMember.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{selectedMember.phone}</span>
                    </div>
                  )}
                  {selectedMember.employer && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{selectedMember.employer}</span>
                    </div>
                  )}
                </div>

                {/* Membership dates */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Membership</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium">{selectedMember.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Renewal</p>
                      <p className="font-medium">{selectedMember.renewalDate}</p>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                {selectedMember.interests.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Interests</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.interests.map((interest) => (
                        <Badge key={interest} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full"
                    onClick={() => toast.success(`Email sent to ${selectedMember.name}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" /> Send Email
                  </Button>
                  {selectedMember.status !== "Active" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.success(`Renewal initiated for ${selectedMember.name}`)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Renew Membership
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
