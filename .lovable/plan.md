
## Add Admin Quick-Login to `/login`

Add a 5th demo account card (Admin) to the Quick Login grid on the login page so admins can sign in directly, separate from the Executive Director.

### Changes

**1. `src/pages/Login.tsx`**
- Add a new entry to the `TEST_ACCOUNTS` array:
  - Label: `Admin`
  - Email: `admin@nonprofitai.software`
  - Role: `admin`
  - Icon: `ShieldCheck` (already imported)
  - Color: `border-orange-500/30 hover:bg-orange-500/10` (matches the Admin badge color used in TopNav)
- Adjust the Quick Login grid so 5 cards lay out cleanly. Keep `grid-cols-2` (2 columns × 3 rows; 5th card occupies the first cell of row 3 — clean and consistent with current card sizing).

**2. Backend — create the admin demo user**
- Use Cloud Auth tools to create user `admin@nonprofitai.software` with password `Demo@123` (matches existing demo password constant).
- Insert a row into `public.user_roles` with `role = 'admin'` for that user so `AdminRoute` grants access.
- Note: The existing demo-account guard in `AdminRoute.tsx` blocks any email containing `demo@`. The address `admin@nonprofitai.software` does NOT contain `demo@`, so the guard will correctly allow this admin in while still blocking other demo accounts. No change to `AdminRoute` needed.

**3. Profile setup**
- The `handle_new_user` trigger auto-creates a `profiles` row on signup, so no manual profile insert is required. We just add the `user_roles` entry for `admin`.

### Behavior After Change

- `/login` Quick Login grid shows 5 cards: Executive Director, Development Director, Finance Manager, Operations Manager, **Admin**.
- Clicking Admin signs in as `admin@nonprofitai.software`, navigates to `/dashboard`, and shows the orange "Admin" badge in TopNav.
- Admin can navigate to `/admin` successfully (other 4 roles still cannot).
- Quick Login section remains hidden in production (`spark-start-kit-86.lovable.app`), unchanged.

### Out of Scope

- No changes to `AdminRoute`, `TopNav`, navigation structure, or role logic — those already work correctly from prior turns.
- No production exposure of admin quick-login (production check already in place).
