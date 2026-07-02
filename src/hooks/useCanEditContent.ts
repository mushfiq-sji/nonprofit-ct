import { useAuth } from "@/contexts/AuthContext";
import { isAppAdmin, isNonprofitContentEditor } from "@/lib/auth-roles";

/**
 * True when the user may edit community modules (volunteers, membership, events, gallery).
 * App admins/editors plus nonprofit role holders (e.g. Quick Login Executive Director).
 */
export function useCanEditContent(): boolean {
  const { profile } = useAuth();
  return isAppAdmin(profile?.role) || isNonprofitContentEditor(profile?.agencyRole);
}
