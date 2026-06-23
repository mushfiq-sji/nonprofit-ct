# Architecture Baseline

Every spec assumes this is already true. If it is not, fix it before starting the spec.

## Stack
- **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind v3, shadcn/ui, Lucide, React Router v6, TanStack React Query v5, React Hook Form + Zod
- **Backend**: Supabase — Postgres + Row Level Security + Edge Functions (Deno runtime)
- **AI**: Lovable AI Gateway via the AI SDK (`npm:ai` + `@ai-sdk/openai-compatible`)
- **Build**: `npm run dev` on port 8080, `npm run build`, `npm run lint`

## Folder layout
```
src/
├── components/        # PascalCase, by domain
├── contexts/          # AuthContext, BrandingContext, etc.
├── hooks/             # useXxx.ts (camelCase)
├── integrations/
│   └── supabase/
│       ├── client.ts  # auto-generated, do not edit
│       └── types.ts   # auto-generated, do not edit
├── lib/               # cache.ts, validation.ts, sanitize.ts, activity-logger.ts
├── modules/<name>/    # routes.tsx + index.ts per module
├── pages/             # Route page components
├── services/          # <domain>.service.ts — all data access (see Phase 1 §01)
├── shared/
│   ├── config/        # modules.ts, env.ts
│   └── data/          # nonprofitDemoData.ts, navigationStructure.ts
└── types/

supabase/
├── functions/<kebab-name>/index.ts
├── migrations/
└── config.toml
```

## Naming
| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `DonorPipeline.tsx` |
| Hook file | `use` + camelCase | `useDonors.ts` |
| Service file | `<domain>.service.ts` | `donors.service.ts` |
| Util | camelCase | `formatCurrency.ts` |
| DB table | snake_case | `nonprofit_donations` |
| Edge function dir | kebab-case | `donor-retention-agent` |
| Env var (client) | `VITE_` prefix | `VITE_SUPABASE_URL` |
| Env var (server) | UPPER_SNAKE | `LOVABLE_API_KEY` |

## Database rules (non-negotiable)

Every `CREATE TABLE public.<name>` migration MUST run, in this order, in the same migration:

```sql
-- 1. CREATE TABLE
CREATE TABLE public.example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                -- never FK to auth.users
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. GRANT (REQUIRED — RLS alone is not enough)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.example TO authenticated;
GRANT ALL ON public.example TO service_role;
-- Add `GRANT SELECT ... TO anon;` ONLY for fully public data.

-- 3. RLS
ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
CREATE POLICY "Users manage own rows"
  ON public.example FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Roles live in a **separate** `user_roles` table. Check with `public.has_role(auth.uid(), 'admin')` — never store role on `profiles`.

## Edge function rules
- One file per function: `supabase/functions/<name>/index.ts`
- Always include CORS headers
- Validate input with Zod, return 400 on failure
- Validate JWT in code via `supabase.auth.getClaims(token)`
- Never run raw SQL from client input
- AI calls use the Lovable AI Gateway provider; key is `LOVABLE_API_KEY` (already in secrets)

## Activity logging
Use `logCrud()`, `logLogin()`, `logLogout()` from `src/lib/activity-logger.ts` on every mutation that matters for audit (donations, grants, board reports, role changes).

## What NOT to touch
- `src/integrations/supabase/client.ts` (auto-gen)
- `src/integrations/supabase/types.ts` (auto-gen)
- `supabase/config.toml` (project-level — Lovable manages)
- `.env` keys prefixed `VITE_SUPABASE_` (auto-gen)
