

## Problem

The quick login buttons attempt `signIn(email, "Demo@123")` for three test accounts that don't exist in the authentication system. Every attempt returns `400: Invalid login credentials`.

## Root Cause

This Lovable Cloud project was set up recently and the demo/test user accounts were never seeded into the auth system. The quick login feature is hardcoded to use these emails with password `Demo@123`, but no users with those credentials exist.

## Fix Plan

### Step 1 — Create the three demo accounts

You need to sign up these accounts manually through the app's `/signup` page (or I can create them via the authentication system):

| Email | Password | Role |
|-------|----------|------|
| ceo@collabai.software | Demo@123 | owner/admin |
| demo@collabai.software | Demo@123 | pm |
| ic@collabai.software | Demo@123 | user |

Since email confirmation is likely enabled, I will need to either:
- **Option A**: Temporarily enable auto-confirm, create the users via signup, then disable auto-confirm
- **Option B**: Create users via an edge function using the Supabase admin API (service role key) which bypasses email confirmation

**Recommended: Option B** — Create a one-time edge function or use the existing auth system to seed these accounts with confirmed emails.

### Step 2 — Assign roles

After creating the users, insert appropriate rows into `user_roles` and `profiles` tables so each account has the correct access level.

### Step 3 — Verify

Test each quick login button to confirm they authenticate and redirect to `/dashboard`.

## Technical Details

- The `handle_new_user` trigger will auto-create profile rows on signup
- User roles need manual insertion into `user_roles` table
- No code changes needed — the Login.tsx logic is correct, it just needs the accounts to exist

