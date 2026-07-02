export type AppRole = "admin" | "moderator" | "user";

/** User-facing labels for app roles (DB value `moderator` displays as Editor). */
export const APP_ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  moderator: "Editor",
  user: "User",
};

export function formatAppRoleLabel(role?: string | null): string {
  if (!role) return APP_ROLE_LABELS.user;
  return APP_ROLE_LABELS[role as AppRole] ?? role;
}

const ROLE_PRIORITY: Record<AppRole, number> = {
  admin: 3,
  moderator: 2,
  user: 1,
};

/** True when the user has app-level admin or moderator access. */
export function isAppAdmin(role?: string | null): boolean {
  return role === "admin" || role === "moderator";
}

const NONPROFIT_CONTENT_EDITOR_ROLES = new Set([
  "executive_director",
  "development_director",
  "finance_manager",
  "operations_manager",
  "owner",
  "pm",
  "ic",
]);

/** True when the user has a nonprofit dashboard role that may edit live community data. */
export function isNonprofitContentEditor(agencyRole?: string | null): boolean {
  return agencyRole != null && NONPROFIT_CONTENT_EDITOR_ROLES.has(agencyRole);
}

/** Pick the highest-privilege app role when a user has multiple rows in user_roles. */
export function pickHighestAppRole(
  roles: Array<{ role: string }> | null | undefined
): AppRole | undefined {
  if (!roles?.length) return undefined;

  let best: AppRole | undefined;
  let bestScore = 0;

  for (const row of roles) {
    const role = row.role as AppRole;
    const score = ROLE_PRIORITY[role] ?? 0;
    if (score > bestScore) {
      best = role;
      bestScore = score;
    }
  }

  return best;
}
