import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, AlertTriangle, ArrowRight } from "lucide-react";
import { DEMO_AGENTS } from "@/shared/data/nonprofitDemoData";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function PageSkeleton() {
  return (
    <div className="space-y-6 pt-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AIAgentsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "AI Agent Center | Nonprofit AI";
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Agent Center</h1>
        <p className="text-muted-foreground mt-1">
          Operational agents processing your nonprofit data
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {DEMO_AGENTS.filter((a) => a.status === "Active").length} agents active &middot; Last run: 1 hour ago
        </p>
      </div>

      {DEMO_AGENTS.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Bot className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No AI agents configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {DEMO_AGENTS.map((agent) => (
            <Card
              key={agent.id}
              className="border border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className="border-green-300 bg-green-50 text-green-700 text-xs"
                        >
                          {agent.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Last run: {agent.lastRun}
                        </span>
                      </div>
                    </div>
                  </div>
                  {agent.alertCount > 0 ? (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {agent.alertCount}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-200 text-slate-400"
                    >
                      0
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {agent.description}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/ai-agents/${agent.id}`)}
                  >
                    View Details
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" disabled>
                        Run Now
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Agents run on schedule
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
