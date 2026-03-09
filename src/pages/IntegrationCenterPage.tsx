import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plug, CheckCircle, AlertTriangle, Settings, Zap } from "lucide-react";
import { DEMO_INTEGRATIONS, type DemoIntegration } from "@/shared/data/nonprofitDemoData";

const STATUS_STYLES = {
  healthy: "border-green-300 bg-green-50 text-green-700",
  warning: "border-amber-300 bg-amber-50 text-amber-700",
  error: "border-red-300 bg-red-50 text-red-700",
};

function IntegrationCard({ integration }: { integration: DemoIntegration }) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-2xl">
            {integration.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{integration.name}</h3>
              {integration.connected ? (
                <Badge variant="outline" className={STATUS_STYLES[integration.status || "healthy"]}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                  Not connected
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{integration.description}</p>
            {integration.connected && (
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>Last sync: {integration.lastSync}</span>
                {integration.syncedRecords && <span>&middot; {integration.syncedRecords} records</span>}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {integration.connected ? (
            <>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Manage
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" className="gap-1.5">
              <Plug className="h-3.5 w-3.5" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-11 w-11 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 mt-4" />
      </CardContent>
    </Card>
  );
}

export default function IntegrationCenterPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Integration Center | Nonprofit AI";
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const categories = Array.from(new Set(DEMO_INTEGRATIONS.map((i) => i.category)));
  const connectedCount = DEMO_INTEGRATIONS.filter((i) => i.connected).length;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integration Center</h1>
        <p className="text-sm text-muted-foreground">
          Connect your existing tools to power your AI agents
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            {connectedCount} of {DEMO_INTEGRATIONS.length} connected
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <IntegrationSkeleton />
                <IntegrationSkeleton />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const items = DEMO_INTEGRATIONS.filter((i) => i.category === category);
            return (
              <div key={category}>
                <h2 className="text-lg font-semibold mb-4">{category}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((integration) => (
                    <IntegrationCard key={integration.id} integration={integration} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
