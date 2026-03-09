import { useState, useEffect } from "react";

import {
  Download,
  RefreshCw,
  Users,
  DollarSign,
  Clock,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_BOARD_REPORT } from "@/shared/data/nonprofitDemoData";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
  detailColor?: string;
}

function KpiCard({ icon, label, value, detail, detailColor = "text-green-600" }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {detail && (
            <p className={`mt-0.5 text-xs font-medium ${detailColor}`}>{detail}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export default function BoardReportsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Board Reports | Nonprofit AI";
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Board Reports</h1>
        <p className="text-sm text-muted-foreground">
          Board-ready reports generated from your organization's data
        </p>
      </div>

      {/* Status Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 ring-1 ring-green-200 border-0">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              {DEMO_BOARD_REPORT.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {DEMO_BOARD_REPORT.quarter} &middot; Generated {DEMO_BOARD_REPORT.generatedDate}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Generate New Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Total Donors"
          value={DEMO_BOARD_REPORT.totalDonors.toLocaleString()}
          detail={`↑${DEMO_BOARD_REPORT.donorGrowth}% vs last quarter`}
        />
        <KpiCard
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          label="Total Revenue"
          value={`$${DEMO_BOARD_REPORT.totalRevenue.toLocaleString()}`}
          detail={`${DEMO_BOARD_REPORT.revenueVsGoal}% of $${DEMO_BOARD_REPORT.revenueGoal.toLocaleString()} goal`}
        />
        <KpiCard
          icon={<Clock className="h-5 w-5 text-primary" />}
          label="Volunteer Hours"
          value={DEMO_BOARD_REPORT.volunteerHours.toLocaleString()}
        />
        <KpiCard
          icon={<Briefcase className="h-5 w-5 text-primary" />}
          label="Active Programs"
          value={String(DEMO_BOARD_REPORT.programsActive)}
        />
      </div>

      {/* Revenue Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Goal</CardTitle>
          <CardDescription>
            ${DEMO_BOARD_REPORT.totalRevenue.toLocaleString()} of ${DEMO_BOARD_REPORT.revenueGoal.toLocaleString()} annual goal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${DEMO_BOARD_REPORT.revenueVsGoal}%` }}
              />
            </div>
            <span className="text-sm font-medium text-primary">{DEMO_BOARD_REPORT.revenueVsGoal}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Additional KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          label="Donor Retention Rate"
          value={`${DEMO_BOARD_REPORT.retentionRate}%`}
        />
        <KpiCard
          icon={<Users className="h-5 w-5 text-primary" />}
          label="New Donors This Quarter"
          value={DEMO_BOARD_REPORT.newDonors.toString()}
        />
        <KpiCard
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          label="Avg Gift Size"
          value={`$${Math.round(DEMO_BOARD_REPORT.totalRevenue / DEMO_BOARD_REPORT.totalDonors)}`}
        />
      </div>

      {/* Financial Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Snapshot</CardTitle>
          <CardDescription>
            Revenue, expenses, and fund balance summary for {DEMO_BOARD_REPORT.quarter}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_BOARD_REPORT.financialSnapshot.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  {item.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={item.change >= 0 ? "text-green-600" : "text-red-600"}>
                    {item.change >= 0 ? "+" : ""}{item.change}% vs last quarter
                  </span>
                </p>
              </div>
              <p className="text-lg font-semibold">
                ${item.amount.toLocaleString()}
              </p>
            </div>
          ))}
          <div className="mt-4">
            <Button variant="outline" className="gap-1.5">
              <Eye className="h-4 w-4" />
              View Full Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
