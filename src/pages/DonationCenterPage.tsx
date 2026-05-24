/**
 * Donation Center — /donations
 *
 * Campaign management, donation tracking, and fund breakdown reporting.
 * All data is demo data — no Supabase queries.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  DollarSign, TrendingUp, Users, Target, Heart, RefreshCw, BarChart3,
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
import {
  DEMO_CAMPAIGNS, DEMO_DONATIONS_RECENT, DEMO_DONATION_STATS,
  type DonationFrequency, type DonationFundDesignation,
} from "@/shared/data/nonprofitDemoData";

// ── Helpers ──────────────────────────────────────────────────────

function frequencyBadgeColor(frequency: DonationFrequency): string {
  const map: Record<DonationFrequency, string> = {
    "One-Time": "bg-gray-100 text-gray-700 border-gray-200",
    Monthly: "bg-green-100 text-green-700 border-green-200",
    Quarterly: "bg-blue-100 text-blue-700 border-blue-200",
    Annual: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return map[frequency];
}

// ── Form schema ───────────────────────────────────────────────────

const donationSchema = z.object({
  donorName: z.string().min(2, "Name required"),
  amount: z.coerce.number().min(1, "Amount must be at least $1"),
  frequency: z.enum(["One-Time", "Monthly", "Quarterly", "Annual"] as const),
  campaignId: z.string().min(1, "Select a campaign"),
  fundDesignation: z.enum(["General Operating", "Youth Programs", "Health Initiative", "Technology Fund", "Emergency Relief"] as const),
});
type DonationForm = z.infer<typeof donationSchema>;

// ── Component ─────────────────────────────────────────────────────

export default function DonationCenterPage() {
  const [frequencyFilter, setFrequencyFilter] = useState<DonationFrequency | "All">("All");

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: "",
      amount: 0,
      frequency: "One-Time",
      campaignId: "",
      fundDesignation: "General Operating",
    },
  });

  const filteredDonations = DEMO_DONATIONS_RECENT.filter(
    (d) => frequencyFilter === "All" || d.frequency === frequencyFilter
  );

  const onSubmit = (data: DonationForm) => {
    const campaign = DEMO_CAMPAIGNS.find((c) => c.id === data.campaignId);
    toast.success(`Donation recorded`, {
      description: `$${data.amount} ${data.frequency} donation from ${data.donorName} to ${campaign?.name ?? "campaign"}.`,
    });
    form.reset();
  };

  const kpiCards = [
    { label: "Raised This Year", value: `$${DEMO_DONATION_STATS.totalRaisedThisYear.toLocaleString()}`, icon: TrendingUp, color: "text-green-600" },
    { label: "Average Gift", value: `$${DEMO_DONATION_STATS.averageGift}`, icon: DollarSign, color: "text-blue-600" },
    { label: "Recurring Donors", value: DEMO_DONATION_STATS.recurringDonors, icon: RefreshCw, color: "text-purple-600" },
    { label: "Active Campaigns", value: DEMO_DONATION_STATS.activeCampaigns, icon: Target, color: "text-amber-600" },
  ];

  const frequencyFilters: Array<DonationFrequency | "All"> = ["All", "One-Time", "Monthly", "Quarterly", "Annual"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Donation Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage campaigns, track donations, and analyze fund allocation
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
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color} opacity-80 shrink-0`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="funds">Fund Breakdown</TabsTrigger>
          <TabsTrigger value="new">New Donation</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_CAMPAIGNS.map((campaign) => {
              const pct = Math.round((campaign.raised / campaign.goal) * 100);
              const remaining = campaign.goal - campaign.raised;
              return (
                <Card key={campaign.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{campaign.name}</CardTitle>
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 border-blue-200 shrink-0">
                        {campaign.fundDesignation}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{campaign.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">${campaign.raised.toLocaleString()} raised</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Goal: ${campaign.goal.toLocaleString()} · {remaining > 0 ? `$${remaining.toLocaleString()} to go` : "Goal reached! 🎉"}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {campaign.donorCount} donors
                      </span>
                      {campaign.endDate && (
                        <span>Ends {campaign.endDate}</span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.success(`Sharing ${campaign.name}`, { description: "Campaign link copied to clipboard" })}
                    >
                      <Heart className="h-3.5 w-3.5 mr-1.5" /> Share Campaign
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Donations Tab */}
        <TabsContent value="donations" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {frequencyFilters.map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={frequencyFilter === filter ? "default" : "outline"}
                onClick={() => setFrequencyFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="hidden md:table-cell">Campaign</TableHead>
                    <TableHead className="hidden lg:table-cell">Fund</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium text-sm">{donation.donorName}</TableCell>
                      <TableCell className="text-sm font-semibold text-green-700 dark:text-green-400">
                        ${donation.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${frequencyBadgeColor(donation.frequency)}`}>
                          {donation.frequency}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {donation.campaignName}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {donation.fundDesignation}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {donation.date}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {donation.paymentMethod}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Showing {filteredDonations.length} of {DEMO_DONATIONS_RECENT.length} donations
          </p>
        </TabsContent>

        {/* Fund Breakdown Tab */}
        <TabsContent value="funds">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Fund Allocation — This Year
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DEMO_DONATION_STATS.fundBreakdown.map((item) => (
                <div key={item.fund} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.fund}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">${item.amount.toLocaleString()}</span>
                      <span className="font-semibold w-10 text-right">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-2">
                Total: ${DEMO_DONATION_STATS.totalRaisedThisYear.toLocaleString()} raised this year
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Donation Tab */}
        <TabsContent value="new">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle className="text-base">Record a Donation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="don-name">Donor Name</Label>
                  <Input id="don-name" placeholder="Jane Smith" {...form.register("donorName")} />
                  {form.formState.errors.donorName && (
                    <p className="text-xs text-destructive">{form.formState.errors.donorName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="don-amount">Amount ($)</Label>
                  <Input id="don-amount" type="number" min={1} step={1} placeholder="100" {...form.register("amount")} />
                  {form.formState.errors.amount && (
                    <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Frequency</Label>
                  <Select value={form.watch("frequency")} onValueChange={(v) => form.setValue("frequency", v as DonationFrequency)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-Time">One-Time</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Campaign</Label>
                  <Select value={form.watch("campaignId")} onValueChange={(v) => form.setValue("campaignId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                    <SelectContent>
                      {DEMO_CAMPAIGNS.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.campaignId && (
                    <p className="text-xs text-destructive">{form.formState.errors.campaignId.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Fund Designation</Label>
                  <Select value={form.watch("fundDesignation")} onValueChange={(v) => form.setValue("fundDesignation", v as DonationFundDesignation)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Operating">General Operating</SelectItem>
                      <SelectItem value="Youth Programs">Youth Programs</SelectItem>
                      <SelectItem value="Health Initiative">Health Initiative</SelectItem>
                      <SelectItem value="Technology Fund">Technology Fund</SelectItem>
                      <SelectItem value="Emergency Relief">Emergency Relief</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" /> Record Donation
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
