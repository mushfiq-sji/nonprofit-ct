# Email Adapter

## 1. Goal
Send transactional and bulk email through any provider behind one `send-email` edge function. SendGrid is default; Resend and Mailgun are swappable via config.

## 2. User story
As an **admin**, I want **to plug in our existing email provider**, so that **deliverability and reply-to addresses match our brand**.

## 3. KPI moved
- % of emails sent from customer's own domain: **0% → 80%**

## 4. Scope (IN)
- Edge function `send-email` accepts `{ to, subject, html, text, from?, reply_to? }`
- Routes to provider based on `organization_integrations` (category='email', is_active=true)
- Adapters: SendGrid (default — secret already set), Resend, Mailgun
- "Test send" button on admin Integrations page

## 5. Out of scope (OUT)
- Email template editor
- Tracking pixel / open rate (existing `send-email-with-tracking` covers this)

## 6. Files to create / change
```
supabase/functions/send-email/index.ts          (refactor to dispatch)
supabase/functions/_shared/email/
├── types.ts                                    (EmailProvider interface)
├── sendgrid.provider.ts
├── resend.provider.ts
└── mailgun.provider.ts

src/services/email.service.ts                   (client wrapper)
```

## 7. Data model
Uses `organization_integrations` (category='email'). No new tables.

## 8. API surface
**POST** `/send-email`
- Auth: JWT required
- Request:
```json
{ "to": "person@org.org", "subject": "...", "html": "...", "text": "...", "from": "no-reply@org.org" }
```
- Response: `{ ok: true, provider: "sendgrid", message_id: "..." }`
- Errors: 400 validation, 401 auth, 502 provider failure

## 9. UI spec
- On Integrations page (module 05): Email card with provider radio + API key field + From-address + Test button

## 10. Acceptance criteria
- [ ] Default config sends via SendGrid (already configured)
- [ ] Switching to Resend with valid key sends via Resend
- [ ] Bad key → 502 with helpful message
- [ ] Activity logged: `logActivity('email_sent', { provider, to_hash })` (hash to-address for PII)

## 11. Cursor handoff prompt
```
TASK: docs/roadmap/phase-3-portability/02-email-adapter.md

Refactor send-email to dispatch to the active provider read from organization_integrations. Implement 3 provider adapters. Hash PII in logs.

Provider secrets are server-only (SENDGRID_API_KEY already set; RESEND_API_KEY / MAILGUN_API_KEY added via secrets tool if user configures).
Run gstack.
```
