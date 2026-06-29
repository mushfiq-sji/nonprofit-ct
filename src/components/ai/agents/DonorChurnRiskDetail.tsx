import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Download,
  Heart,
  Loader2,
  Mail,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDonorChurnRisk, type DonorChurnRiskRunResult } from "@/hooks/useDonorChurnRisk";
import { useLiveAgentDetailBootstrap } from "@/hooks/useLiveAgentDetailBootstrap";
import type { DonorChurnRiskResult } from "@/types/donor-churn-risk";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function riskBadgeClass(level: string): string {
  if (level === "high") return "bg-red-100 text-red-800 dark:bg-red-950/30";
  if (level === "medium") return "bg-amber-100 text-amber-800 dark:bg-amber-950/30";
  return "bg-slate-100 text-slate-700";
}

function ChurnOutput({
  data,
  latencyMs,
  model,
  provider,
  runId,
}: {
  data: DonorChurnRiskResult;
  latencyMs: number;
  model: string;
  provider: string;
  runId?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Scanned in {(latencyMs / 1000).toFixed(1)}s
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          {model}
        </Badge>
        {data.time_saved_minutes > 0 && (
          <Badge className="gap-1 bg-green-600 hover:bg-green-600 text-white border-0">
            <Clock className="h-3 w-3" />~{data.time_saved_minutes} min saved
          </Badge>
        )}
        {runId && (
          <Badge variant="outline" className="font-mono text-[10px]">
            run logged
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{data.total_scanned}</p>
            <p className="text-xs text-muted-foreground">Donors scanned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{data.high_risk_count}</p>
            <p className="text-xs text-muted-foreground">High risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{data.medium_risk_count}</p>
            <p className="text-xs text-muted-foreground">Medium risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              ${data.revenue_at_risk.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Revenue at risk</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Portfolio summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </CardContent>
      </Card>

      {data.recommended_action && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-700" />
              Recommended next step
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">{data.recommended_action}</p>
            <Button size="sm" variant="outline" onClick={() => navigate("/donor-retention")}>
              Open donor retention
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              At-risk & lapsed donors
            </CardTitle>
            <CardDescription>Segmented by tier — sorted by engagement risk, highest first</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5"
            onClick={() => {
              const csv = [
                "Name,Segment,Risk,Days Lapsed,Lifetime Giving,Recommended Outreach",
                ...data.at_risk_donors.map(
                  (d) =>
                    `"${d.name}","${d.segment}","${d.risk_level}",${d.days_since_last_gift},${d.total_giving},"${d.recommended_outreach.replace(/"/g, '""')}"`
                ),
              ].join("\n");
              navigator.clipboard.writeText(csv);
              toast.success("Donor list exported", {
                description: `${data.at_risk_donors.length} at-risk donors copied as CSV`,
              });
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Export list
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Days lapsed</TableHead>
                <TableHead>Lifetime</TableHead>
                <TableHead>Outreach</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.at_risk_donors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{donor.name}</p>
                    <p className="text-xs text-muted-foreground">{donor.segment}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", riskBadgeClass(donor.risk_level))}>
                      {donor.risk_level} ({donor.risk_score})
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{donor.days_since_last_gift}</TableCell>
                  <TableCell className="text-sm">${donor.total_giving.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs">
                    {donor.recommended_outreach}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() =>
                        toast.success(`Draft email ready for ${donor.name}`, {
                          description: donor.recommended_outreach,
                        })
                      }
                    >
                      <Mail className="h-3 w-3" />
                      Draft email
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DonorChurnRiskDetail() {
  const churn = useDonorChurnRisk();
  const [result, setResult] = useState<{
    data: DonorChurnRiskResult;
    latencyMs: number;
    model: string;
    provider: string;
    runId?: string;
  } | null>(null);

  const applyRunResult = useCallback((data: DonorChurnRiskRunResult) => {
    setResult({
      data: data.result,
      latencyMs: data.latencyMs,
      model: data.model,
      provider: data.provider,
      runId: data.runId,
    });
  }, []);

  const handleScan = async () => {
    setResult(null);
    try {
      const data = await churn.mutateAsync(undefined);
      applyRunResult(data);
    } catch {
      // Hook resolves with client fallback.
    }
  };

  useLiveAgentDetailBootstrap({
    run: () => churn.mutateAsync(undefined),
    apply: applyRunResult,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Donor Engagement Scan
          </CardTitle>
          <CardDescription>
            Analyzes giving history, segments donors by tier, flags lapsed donors (12+ months
            without a gift), and recommends personalized re-engagement actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleScan} disabled={churn.isPending} className="gap-1.5">
            {churn.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing donors…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run Engagement Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <ChurnOutput
          data={result.data}
          latencyMs={result.latencyMs}
          model={result.model}
          provider={result.provider}
          runId={result.runId}
        />
      )}
    </div>
  );
}
