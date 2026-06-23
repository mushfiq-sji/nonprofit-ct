# Module Marketplace v1

## 1. Goal
Let customers install/uninstall optional modules (Capital Campaigns, Membership Renewal, Auction Manager, Volunteer Hours Reporting) without forking code.

## 2. User story
As an **ED**, I want **to enable just the modules my org needs**, so that **my staff sees only relevant features**.

## 3. KPI moved
- Modules enabled per org (engagement signal)
- Reduction in "feature overload" feedback

## 4. Scope (IN)
- `marketplace_listings` table (curated, no third-party publish in v1)
- `/admin/marketplace` page browses listings, install toggles row in `app_modules`
- Each module has a manifest: name, description, screenshot, required tables, default routes, dependencies
- Install creates missing tables via SQL bundled with the manifest
- Uninstall hides routes but preserves data (toggle to delete on uninstall — admin opt-in)

## 5. Out of scope (OUT)
- Third-party module publishing (v2)
- Module revenue share

## 6. Files
```
supabase/functions/marketplace-install/index.ts
supabase/functions/marketplace-uninstall/index.ts
src/pages/admin/Marketplace.tsx
src/components/marketplace/ListingCard.tsx
src/services/marketplace.service.ts
supabase/migrations/<ts>_marketplace_listings.sql
```

## 7. Data
```sql
CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  screenshot_url TEXT,
  manifest JSONB NOT NULL,        -- routes, tables, dependencies
  install_sql TEXT,               -- run on install
  is_official BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authed can read marketplace"
  ON public.marketplace_listings FOR SELECT
  USING (auth.role() = 'authenticated');
```

Seed 4 starter listings: capital_campaigns, membership_renewal, auction_manager, volunteer_hours.

## 8. API surface
**POST** `/marketplace-install`
- Auth: admin
- Request: `{ slug: string }`
- Response: `{ ok: true, installed_tables: string[] }`

**POST** `/marketplace-uninstall`
- Auth: admin
- Request: `{ slug: string, delete_data?: boolean }`
- Response: `{ ok: true }`

## 9. UI spec
- Grid of listing cards with Install / Uninstall buttons
- Confirm dialog on uninstall (warn about data)

## 10. Acceptance criteria
- [ ] Install a listing → routes appear in sidebar
- [ ] Uninstall → routes hidden, data preserved by default
- [ ] Server checks admin role
- [ ] Activity logged

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-4-marketplace-compliance/01-module-marketplace-v1.md
Server admin-check via has_role on every request. Install must be idempotent. Run gstack.
```
