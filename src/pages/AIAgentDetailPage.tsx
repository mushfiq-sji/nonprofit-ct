import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Bot,
  Plug,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";
import { DEMO_AGENTS } from "@/shared/data/nonprofitDemoData";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SEVERITY_STYLES = {
  amber: "bg-amber-50 border-amber-200 text-amber-800",
  red: "bg-red-50 border-red-200 text-red-800",
  green: "bg-green-50 border-green-200 text-green-800",
  blue: "bg-blue-50 border-blue-200 text-blue-800",
};

function PageSkeleton() {
  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

export default function AIAgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const agent = DEMO_AGENTS.find((a) => a.id === id);

  useEffect(() => {
    document.title = agent ? `${agent.name} | Nonprofit AI` : "Agent Not Found | Nonprofit AI";
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [agent]);

  if (isLoading) return <PageSkeleton />;

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Bot className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Agent not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/ai-agents")}
        >
          Back to Agent Center
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/ai-agents")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {agent.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className="border-green-300 bg-green-50 text-green-700 text-xs"
                >
                  {agent.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last run: {agent.lastRun}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{agent.description}</p>
        </CardContent>
      </Card>

      {/* Connected Integrations */}
      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Connected Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {agent.integrations.map((integration) => (
              <Badge
                key={integration}
                variant="secondary"
                className="bg-slate-100 text-slate-700 border-slate-200"
              >
                {integration}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Findings */}
      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Recent Findings ({agent.findings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {agent.findings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">No findings — everything looks good</p>
            </div>
          ) : (
            agent.findings.map((finding, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-lg border p-3 ${SEVERITY_STYLES[finding.severity]}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{finding.text}</p>
                  <p className="text-xs opacity-70 mt-0.5">{finding.time}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${SEVERITY_STYLES[finding.severity]}`}
                >
                  {finding.severity}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Suggested Actions */}
      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Suggested Actions ({agent.actions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {agent.actions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">No pending actions</p>
            </div>
          ) : (
            agent.actions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm text-foreground">{action.text}</p>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button size="sm" variant="outline">
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground">
                    Dismiss
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" disabled>
              Run Now
            </Button>
          </TooltipTrigger>
          <TooltipContent>Agents run on schedule</TooltipContent>
        </Tooltip>
        <Button
          variant="outline"
          onClick={() => navigate(`/ai-agents/${agent.id}/settings`)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configure Agent
        </Button>
      </div>
    </div>
  );
}
