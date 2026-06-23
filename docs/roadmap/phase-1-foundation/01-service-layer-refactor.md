# Phase 1 · 01 — Service Layer Refactor

## 1. Goal
Move every direct `supabase.from(...)` call out of components and hooks into a single `src/services/<domain>.service.ts` file per domain so future refactors, host swaps, and tests have one place to change.

## 2. User story
As a **developer remixing this project**, I want **one file per domain that owns all data access**, so that **I can swap Supabase host or change a query without grepping 200 components**.

## 3. KPI moved
- Files touched per schema change: **median 20 → median 2**
- Time to swap to a customer's Supabase: **hours → minutes**

## 4. Scope (IN)
- Create `src/services/` folder with one file per domain
- Move all CRUD into services; hooks call services, components call hooks
- Add Zod return-type schemas at the service boundary
- Typed error class `ServiceError` for predictable failures

## 5. Out of scope (OUT)
- Rewriting React Query keys (keep existing `src/lib/cache.ts`)
- Edge function changes
- UI changes

## 6. Files to create / change
```
src/services/
├── _base.ts                          (new — shared supabase client + ServiceError)
├── donors.service.ts                 (new)
├── donations.service.ts              (new)
├── campaigns.service.ts              (new)
├── members.service.ts                (new)
├── volunteers.service.ts             (new)
├── events.service.ts                 (new)
├── grants.service.ts                 (new)
├── programs.service.ts               (new)
├── board-reports.service.ts          (new)
├── reconciliation.service.ts         (new)
├── data-health.service.ts            (new)
├── ai-runs.service.ts                (new)
├── activity.service.ts               (new)
├── users.service.ts                  (new)
└── settings.service.ts               (new)

src/hooks/*                           (refactor — replace supabase.from with service calls)
src/components/**                     (replace any direct supabase calls)
```

## 7. Data model
No schema changes.

## 8. API surface (per service)
Each service file exports:
```ts
export const donorsService = {
  list(filters?: DonorFilters): Promise<Donor[]>,
  get(id: string): Promise<Donor | null>,
  create(input: NewDonor): Promise<Donor>,
  update(id: string, patch: Partial<Donor>): Promise<Donor>,
  delete(id: string): Promise<void>,
};
```

`_base.ts` exports:
```ts
export class ServiceError extends Error {
  constructor(public code: 'not_found' | 'unauthorized' | 'validation' | 'unknown',
              message: string, public cause?: unknown) { super(message); }
}
export function fromSupabase<T>(result: { data: T | null; error: any }): T { ... }
```

## 9. UI spec
None — internal refactor.

## 10. Acceptance criteria
- [ ] `rg "supabase\.from\(" src/components src/pages src/hooks` returns 0 hits outside `src/services/`
- [ ] Every service file has Zod return type + ServiceError handling
- [ ] All existing React Query hooks still pass through cache keys from `src/lib/cache.ts`
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] App boots and every page renders the same data as before

## 11. Cursor handoff prompt
```
TASK: Refactor the Nonprofit Control Tower to introduce a service layer (docs/roadmap/phase-1-foundation/01-service-layer-refactor.md).

Read docs/roadmap/01-architecture-baseline.md first.

Steps:
1. Create src/services/_base.ts with the supabase client re-export and ServiceError class.
2. For each domain listed in the spec, create <domain>.service.ts with list/get/create/update/delete methods. Use Zod for return-type safety.
3. Find every `supabase.from(...)` call in src/components, src/pages, src/hooks. Replace with a service call (create the service method if missing).
4. Keep React Query hooks; just change the queryFn body to call the service.
5. Run `npm run lint` and `npm run build`. Fix everything.

Output the filled acceptance-criteria checklist when done.
```
