import { useAuth } from "@/contexts/AuthContext";
import { isAppAdmin } from "@/lib/auth-roles";

/**
 * True when the user has app-level admin or moderator role and may edit
 * community modules (volunteers, membership, events, gallery).
 */
export function useCanEditContent(): boolean {
  const { profile } = useAuth();
  return isAppAdmin(profile?.role);
}
