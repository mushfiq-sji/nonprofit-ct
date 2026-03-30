import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { icons, Sparkles, ArrowRight, Bot, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  allTeams,
  CATEGORY_COLORS,
  type AgentTeamDef,
  type AgentTeamAgent,
} from "@/components/ai/agentTeamConfig";
import { cn } from "@/lib/utils";

/* ── demo metadata per agent slug ── */

const AGENT_META: Record<string, { findings: number; lastRun: string; findingColor: string }> = {
  "deal-coach": { findings: 8, lastRun: "3 hours ago", findingColor: "green" },
  "deal-daily-briefing": { findings: 5, lastRun: "Just now", findingColor: "green" },
  "quick-deal-email": { findings: 3, lastRun: "Yesterday", findingColor: "green" },
  "deal-ai-chat": { findings: 0, lastRun: "1 hour ago", findingColor: "green" },
  "mid-donor-upgrade": { findings: 12, lastRun: "2 hours ago", findingColor: "amber" },
  "donor-lapse-detection": { findings: 23, lastRun: "6 hours ago", findingColor: "amber" },
  "meeting-summarizer": { findings: 4, lastRun: "Yesterday", findingColor: "green" },
  "action-item-extractor": { findings: 7, lastRun: "4 hours ago", findingColor: "amber" },
  "meeting-efficiency-analyzer": { findings: 2, lastRun: "Yesterday", findingColor: "green" },
  "client-call-analyzer": { findings: 6, lastRun: "8 hours ago", findingColor: "amber" },
  "eos-coach": { findings: 3, lastRun: "1 day ago", findingColor: "green" },
  "eos-pattern-detective": { findings: 9, lastRun: "5 hours ago", findingColor: "amber" },
  "eos-pod-health": { findings: 1, lastRun: "Yesterday", findingColor: "green" },
  "eos-quarterly-digest": { findings: 0, lastRun: "3 days ago", findingColor: "green" },
  "project-analyst": { findings: 5, lastRun: "7 hours ago", findingColor: "green" },
  "bug-feature-planner": { findings: 4, lastRun: "Yesterday", findingColor: "green" },
  "technical-plan-generator": { findings: 2, lastRun: "2 days ago", findingColor: "green" },
  "code-review-generator": { findings: 6, lastRun: "12 hours ago", findingColor: "amber" },
};

/* ── activity banner messages ── */

const BANNER_MESSAGES = [
  "Mid-Donor Upgrade Agent identified 3 new high-readiness donors in the last hour",
  "Donor Lapse Detection Agent flagged 2 major donors approaching 90-day lapse window",
  "CRM Data Integrity Agent resolved 4 duplicate records — data health score updated to 84%",
];

/* ── helpers ── */

function getIcon(name: string) {
  return (icons as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Bot;
}

function getCategoryForAgent(teamId: string) {
  return CATEGORY_COLORS[teamId] ?? CATEGORY_COLORS.general;
}

/* ── sub-components ── */

function ActivityBanner() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % BANNER_MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 overflow-hidden">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <p
        className={cn(
          "text-sm text-muted-foreground transition-all duration-300",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        )}
      >
        {BANNER_MESSAGES[index]}
      </p>
    </div>
  );
}

function ActivePulse() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="relative flex h-2.5 w-2.5 cursor-default">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">Agent is running</TooltipContent>
    </Tooltip>
  );
}

function BrowseSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function OverlappingIcons({
  agents,
  gradientFrom,
  gradientTo,
  size = "lg",
}: {
  agents: AgentTeamAgent[];
  gradientFrom: string;
  gradientTo: string;
  size?: "sm" | "lg";
}) {
  const s = size === "lg" ? "w-12 h-12" : "w-10 h-10";
  const ring = size === "lg" ? "ring-3" : "ring-2";
  const ml = size === "lg" ? "-ml-3" : "-ml-2.5";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex">
      {agents.slice(0, 4).map((a, i) => {
        const Icon = getIcon(a.icon);
        return (
          <div
            key={a.slug}
            className={cn(
              s,
              "rounded-full flex items-center justify-center text-primary-foreground",
              ring,
              "ring-background",
              i > 0 && ml
            )}
            style={{
              background: `linear-gradient(135deg, hsl(${gradientFrom}), hsl(${gradientTo}))`,
              zIndex: 4 - i,
            }}
            title={a.name}
          >
            <Icon className={iconSize} />
          </div>
        );
      })}
    </div>
  );
}

function TeamCard({ team, onClick }: { team: AgentTeamDef; onClick: () => void }) {
  return (
    <Card
      className={cn(
        "cursor-pointer overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:shadow-xl",
        "border-b-4",
        team.accentColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-4">
        <OverlappingIcons
          agents={team.agents}
          gradientFrom={team.gradientFrom}
          gradientTo={team.gradientTo}
        />
        <div>
          <h3 className="text-xl font-bold text-foreground">{team.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{team.tagline}</p>
        </div>
        <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
          Explore Team
        </Button>
      </CardContent>
    </Card>
  );
}

function AgentBrowseCard({
  agent,
  teamId,
  gradientFrom,
  gradientTo,
}: {
  agent: AgentTeamAgent;
  teamId: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  const navigate = useNavigate();
  const Icon = getIcon(agent.icon);
  const cat = getCategoryForAgent(teamId);
  const meta = AGENT_META[agent.slug];

  return (
    <Card className="overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:shadow-xl">
      {/* gradient header */}
      <div
        className="h-24 relative"
        style={{
          background: `linear-gradient(135deg, hsl(${gradientFrom}), hsl(${gradientTo}))`,
        }}
      >
        <Badge
          className={cn("absolute top-3 right-3 text-[10px] px-2 py-0.5 font-medium border-0", cat.badge)}
        >
          {teamId}
        </Badge>
      </div>

      {/* icon overlapping header/body */}
      <div className="px-5 pt-0 pb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center -mt-7 ring-4 ring-background shadow-lg"
          style={{
            background: `linear-gradient(135deg, hsl(${gradientFrom}), hsl(${gradientTo}))`,
          }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-foreground">{agent.name}</h4>
            <ActivePulse />
          </div>
          <p className="text-xs text-muted-foreground">By Nonprofit AI</p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-2 line-clamp-2">
          {agent.description}
        </p>

        {/* Meta row: findings + last run */}
        {meta && (
          <div className="flex items-center gap-3 mt-3 text-xs">
            {meta.findings > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0.5 font-medium",
                  meta.findingColor === "amber"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                )}
              >
                {meta.findings} findings
              </Badge>
            )}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {meta.lastRun}
            </span>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-4 hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={() => navigate(`/agents/${agent.slug}`)}
        >
          Learn More
        </Button>
      </div>
    </Card>
  );
}

function TeamDetailSection({ team }: { team: AgentTeamDef }) {
  const Icon = getIcon(team.agents[0]?.icon ?? "Bot");

  return (
    <section id={`team-${team.id}`} className="scroll-mt-24 space-y-5">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow"
          style={{
            background: `linear-gradient(135deg, hsl(${team.gradientFrom}), hsl(${team.gradientTo}))`,
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{team.name}</h2>
          <p className="text-sm text-muted-foreground">{team.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {team.agents.map((agent) => (
          <AgentBrowseCard
            key={agent.slug}
            agent={agent}
            teamId={team.id}
            gradientFrom={team.gradientFrom}
            gradientTo={team.gradientTo}
          />
        ))}
      </div>
    </section>
  );
}

/* ── main page ── */

export default function AgentsBrowse() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "AI Agents | Nonprofit AI";
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <BrowseSkeleton />;

  const scrollToTeam = (teamId: string) => {
    document.getElementById(`team-${teamId}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Agents</h1>
          <p className="text-sm text-muted-foreground">
            Browse and run specialized AI agents across your workspace
          </p>
        </div>
      </div>

      {/* Live activity banner */}
      <ActivityBanner />

      {/* Team cards grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Agent Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allTeams.map((team) => (
            <TeamCard key={team.id} team={team} onClick={() => scrollToTeam(team.id)} />
          ))}
        </div>
      </div>

      {/* Team detail sections */}
      {allTeams.map((team) => (
        <TeamDetailSection key={team.id} team={team} />
      ))}
    </div>
  );
}
