# Public Board-Share Link

## 1. Goal
Generate a signed, expiring URL for a board pack so board members can view without logging in.

## 2. User story
As an **ED**, I want **a link I can email to the board**, so that **they read the report without creating an account**.

## 3. KPI moved
- Board pack open rate: **+40%**

## 4. Scope (IN)
- "Share" button on a saved `board_reports` row
- Edge function `board-share-create` issues a JWT (short-lived, scoped to one report id)
- Public route `/board/:token` renders read-only board pack
- Edge function `board-share-fetch` validates token and returns payload
- Revoke button regenerates secret salt

## 5. Out of scope (OUT)
- Per-board-member analytics
- Comments on shared report

## 6. Files
```
supabase/functions/board-share-create/index.ts
supabase/functions/board-share-fetch/index.ts
src/pages/public/BoardShare.tsx       (no auth)
src/services/board-share.service.ts
supabase/migrations/<ts>_board_share_tokens.sql
```

## 7. Data
```sql
CREATE TABLE public.board_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  created_by UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.board_share_tokens TO authenticated;
GRANT ALL ON public.board_share_tokens TO service_role;
ALTER TABLE public.board_share_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creator manages tokens" ON public.board_share_tokens
  FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
```
Time-based validation goes in a trigger, not a CHECK constraint (per project rules).

## 8. API surface
**POST** `/board-share-create` — `{ report_id, ttl_days? }` → `{ url }`
**GET** `/board-share-fetch?token=...` — public; returns `{ payload }` or 410 gone

## 9. UI spec
- Share button on board report → dialog with URL, copy button, expiry
- `/board/:token` page: read-only render, "Powered by Nonprofit Control Tower" badge

## 10. Acceptance criteria
- [ ] Token expires after TTL
- [ ] Revoke makes URL return 410
- [ ] No auth required to view valid URL
- [ ] Cannot brute-force tokens (rate-limited; tokens are 256-bit)
- [ ] Activity logged

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-4-marketplace-compliance/04-public-board-share-link.md
Tokens are random 32-byte values, hashed before storage. Validate on fetch by comparing hash. Use trigger for expiry validation, not CHECK constraint.
Run gstack.
```
