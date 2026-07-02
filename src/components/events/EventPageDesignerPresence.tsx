import AIAgentPresenceIndicator from "@/components/ai/AIAgentPresenceIndicator";
import { CATEGORY_COLORS } from "@/components/ai/agentTeamConfig";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const FUNDRAISING_GRADIENT = CATEGORY_COLORS.fundraising;

interface EventPageDesignerPresenceProps {
  status?: string;
  isBusy?: boolean;
  className?: string;
}

export function EventPageDesignerPresence({
  status,
  isBusy = false,
  className,
}: EventPageDesignerPresenceProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <AIAgentPresenceIndicator
          agentName="Event Page Designer"
          agentSlug="event-page-designer"
          gradientFrom={FUNDRAISING_GRADIENT.from}
          gradientTo={FUNDRAISING_GRADIENT.to}
        />
        {isBusy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {status && (
        <p className="text-xs text-muted-foreground leading-snug">{status}</p>
      )}
    </div>
  );
}
