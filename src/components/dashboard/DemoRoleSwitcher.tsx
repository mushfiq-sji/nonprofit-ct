import { toast } from "sonner";
import { ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAgencyRole, setDemoRoleOverride, type AgencyRole } from "@/hooks/useAgencyRole";

const ROLES: { value: AgencyRole; label: string }[] = [
  { value: "executive_director", label: "Executive Director" },
  { value: "development_director", label: "Development Director" },
  { value: "finance_manager", label: "Finance Manager" },
  { value: "operations_manager", label: "Operations Manager" },
];

export function DemoRoleSwitcher() {
  const { agencyRole } = useAgencyRole();
  const currentLabel = ROLES.find((r) => r.value === agencyRole)?.label ?? "Executive Director";

  const handleChange = (role: AgencyRole) => {
    setDemoRoleOverride(role);
    toast.success(`Viewing as ${ROLES.find((r) => r.value === role)?.label}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full border-border bg-muted/50 px-3 text-xs font-medium text-foreground hover:bg-muted"
        >
          <User className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{currentLabel}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r.value}
            onClick={() => handleChange(r.value)}
            className={agencyRole === r.value ? "bg-accent font-medium" : ""}
          >
            {r.label}
            {agencyRole === r.value && <span className="ml-auto text-primary text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
