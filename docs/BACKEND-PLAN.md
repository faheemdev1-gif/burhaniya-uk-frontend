# Backend implementation plan

## Architecture and sequence

Keep this React/Vite frontend, with Vercel or static Hostinger hosting. Build a separate Node API on Hostinger and a separate MongoDB database for Al Burhaniya UK. Do not reuse the previous organisation's accounts, database, Stripe settings or mailing lists. Confirm the hosting plan supports a persistent Node service before backend deployment. If it does not, choose an API host before implementation.

1. Set up database, staging API, explicit allowed frontend origins, health checks and error reporting. Validate and import the schema-1 content model without overwriting an existing database.
2. Add authenticated staff accounts, roles, draft revisions and a publish workflow. Wire the current studio to authenticated endpoints; local Save preview must be replaced with server persistence. Keep public GET content limited to approved published content. Use revision checks to prevent staff overwriting each other.
3. Add durable image storage and media management. Preserve IDs and alt text. Convert imported preview data URLs to stored image files, replace references and validate decoded type, dimensions and size on the server. Protect uploads and prevent arbitrary server URL fetching. Back up media and content together.
4. Store contact, volunteering and event-interest requests. Then add email delivery, delivery logs and retry handling. The API should only acknowledge receipt after a database write succeeds. Notify admin@burhaniya.org.uk and separately acknowledge the visitor. Choose Resend or SMTP with verified sending-domain DNS and a monitored From address; use Reply-To for the visitor, never the visitor as From.
5. Implement newsletter consent, single-use confirmation links, unsubscribe, suppression and controlled exports. Keep newsletter permissions separate from enquiries. Agree retention and privacy copy before collecting live data.
6. Connect Stripe test-mode Checkout. Create sessions server-side, validate GBP minor-unit amounts and allowed frequency. Use idempotency keys and verify raw-body webhook signatures. Store session/payment references and resolve status through the backend. Mark paid only after authoritative payment verification; reconcile delayed events and refunds. Enable recurring support only once the charity has approved it. Test before switching to live keys.
7. Complete staging acceptance, account recovery, backups and restore tests; confirm real events and copy, then publish.

## Content and accounts

Use the `SiteContent` model in `src/types.ts` and `content/initial-content.json` as the public schema. Suggested collections: users, sessions, contentRevisions, publishedContent, media, enquiries, eventInterests, newsletterSubscribers, donations and webhookReceipts. Staff-only records must never appear in public content JSON.

Use hashed passwords, secure HttpOnly sessions, CSRF protection where applicable, explicit roles (admin/editor) and rate limiting. Create the first administrator through a one-time setup command, not a public registration endpoint. Changing an environment default must not silently change an existing database account. Add an authenticated account-email change flow and documented bootstrap procedure.

Password-reset requests always return the same generic response. Send links only to the account's stored verified email. Store a hash of a short-lived, random, single-use token; invalidate it after use and revoke sessions when the password changes. Never email passwords. Local studio access in this ZIP is not account authentication.

## Events and notification destination

The current design collects **interest**, not a guaranteed reservation. Each submission includes the gathering slug and visitor details. In the backend, save it to eventInterests, show it in the admin dashboard, send the organiser notification to admin@burhaniya.org.uk and send a visitor acknowledgement. Agree whether actual events require capacity, waitlists, cancellation, tickets or payment before calling an action a confirmed registration.

## Server configuration, later

Proposed server-only variables: NODE_ENV, PORT, MONGODB_URI, FRONTEND_URL, ALLOWED_ORIGINS, SESSION_SECRET, ADMIN_EMAIL, EMAIL_PROVIDER, EMAIL_FROM, NOTIFICATION_EMAIL and either RESEND_API_KEY or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS. Stripe requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET. Durable storage requires provider-specific credentials. These are a planned contract, not settings consumed by this frontend. Do not create secrets until the backend is implemented and its final configuration documented. Only VITE_API_URL belongs in the frontend build, and it is public.

## Acceptance criteria

Verify login and reset expiry/reuse; publish visibility and revision conflicts; image replacement after a new browser session; contact notification and delivery failures; event slug attribution and duplicate handling; newsletter consent/unsubscribe; Stripe success, cancellation, delayed webhook, repeated webhook and invalid signature; CORS and validation; and database/media restore. Provide a real dashboard inbox so a failed email never loses a request. Add monitoring for API and email failures. Production mobile and keyboard checks remain part of release acceptance.
