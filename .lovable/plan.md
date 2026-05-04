## Fix: Remove Admin Access from Executive Director

The Executive Director (`director@nonprofitai.software`) currently has the `admin` role in the `user_roles` table, which is why they still see the ADMIN badge and can access the admin panel.

### What will be done

1. **Create a one-time edge function** (`admin-cleanup`) that uses the service role key to:
   - Delete the `admin` role from `director@nonprofitai.software` in `user_roles`
   - Delete the accidentally created `demo@nonprofitai.software` user and their role entry

2. **Deploy and invoke** the edge function to apply the changes immediately

3. **Delete the edge function** after it runs — it's a one-time cleanup

4. **Verify** that the Executive Director no longer has admin access by querying the database

### Result
- Logging in as Executive Director will show no ADMIN badge and no access to `/admin`
- The admin account (`admin@nonprofitai.software` / `Demo@123`) remains the only way to access the admin panel
