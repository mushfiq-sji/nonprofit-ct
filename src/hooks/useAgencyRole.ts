import { useAuth } from "@/contexts/AuthContext";

export type AgencyRole = "owner" | "pm" | "ic";

/**
 * Returns the current user's agency role.
 *
 * Agency roles (owner / pm / ic) are separate from the DB auth roles
 * (admin / moderator / user) and are stored in user_role_preferences.
 *
 * - agencyRole: undefined means no preference row exists → defaults to IC view
 * - isAdmin: true for admin/moderator DB roles (existing behaviour)
 */
export function useAgencyRole() {
  const { profile } = useAuth();

  const agencyRole = profile?.agencyRole ?? null;
  const isAdmin = profile?.role === "admin" || profile?.role === "moderator";

  return {
    agencyRole,
    isAdmin,
    isOwner: agencyRole === "owner",
    isPM: agencyRole === "pm",
    isIC: agencyRole === "ic" || agencyRole === null,
  };
}
