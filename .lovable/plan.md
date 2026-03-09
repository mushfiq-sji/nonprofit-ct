

# Fix: Demo Account Names & Missing Finance Manager

## Problem
The demo accounts in both the seed function and the database profiles still use legacy names ("CEO Demo", "PM Demo", "IC Demo") instead of the nonprofit role names. Additionally, the Finance Manager account (`finance@collabai.software`) is missing from the seed function entirely.

The TopNav and Profile page display `profile.full_name` from the `profiles` table, so the fix requires updating both the seed function and the existing database records.

## Changes

### 1. Update `supabase/functions/seed-demo-accounts/index.ts`
Update the accounts array to use nonprofit role names and add the missing Finance Manager:

| Email | Old Name | New Name | Role |
|-------|----------|----------|------|
| `ceo@collabai.software` | CEO Demo | Executive Director | admin |
| `demo@collabai.software` | PM Demo | Development Director | moderator |
| `finance@collabai.software` | *(missing)* | Finance Manager | user |
| `ic@collabai.software` | IC Demo | Operations Manager | user |

Also update the "already exists" branch to update `full_name` in profiles so re-running the seed fixes stale names.

### 2. Database migration to fix existing profile names
Run a SQL update to correct the `full_name` for the three existing demo accounts:
```sql
UPDATE profiles SET full_name = 'Executive Director' WHERE email = 'ceo@collabai.software';
UPDATE profiles SET full_name = 'Development Director' WHERE email = 'demo@collabai.software';
UPDATE profiles SET full_name = 'Operations Manager' WHERE email = 'ic@collabai.software';
```

This immediately fixes the display without needing to re-run the seed function.

### Files
1. `supabase/functions/seed-demo-accounts/index.ts` — Update names + add Finance Manager account
2. Database migration — Update existing profile `full_name` values

