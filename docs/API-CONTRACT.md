# Frontend API contract, version 1

No backend is included. Set `VITE_API_URL=https://YOUR-API-HOST/api` only once these public endpoints exist. The client appends the paths below. All responses must be JSON with an appropriate HTTP status and `Content-Type: application/json`. Failed requests should return `{ "message": "A useful public error" }`; do not expose stack traces. The browser timeout is 12 seconds. Allow only the approved frontend origins. The existing public client sends no authenticated cookies; a future authenticated admin client must be added separately.

| Method and path | Request | Response consumed by frontend |
| --- | --- | --- |
| GET /site-content | None | Raw schema-1 SiteContent object, not a wrapper |
| POST /contact | submissionId, name, email, topic, message, consent, website | `{ "message": "Your enquiry has been received." }` after durable storage |
| POST /events/:slug/interest | Same enquiry object; slug in URL | `{ "message": "Your interest has been received. The team will contact you." }`; never promise a reservation unless actually made |
| POST /newsletter/subscribe | email, consent, website | `{ "message": "Please check your inbox to confirm." }` with generic duplicate handling |
| POST /donations/checkout | submissionId, amountPence, currency: "gbp", frequency: "once" or "monthly" | `{ "url": "https://checkout.stripe.com/..." }` |
| GET /donations/status?session_id=... | Session ID encoded in query | See status contract below |

Contact consent must be true, email and text must pass server validation, and website is a honeypot that must remain empty. Treat submissionId as an idempotency key with suitable scope and expiry, never as proof of authenticity. Enforce body limits, abuse protection and server rate limits. Newsletter needs its own idempotency handling. Never trust client-side validation or an event slug that is not published and accepting interest.

The frontend allows donation totals from 100 to 1,000,000 pence. Apply the same range and integer check on the server. The backend chooses prices, recurring mode, success/cancel URLs and session metadata. Do not accept arbitrary redirect URLs. Set the successful return to FRONTEND_URL + `/donation/return?session_id={CHECKOUT_SESSION_ID}`. Cancellations should return to `/donate`; the frontend does not infer payment from a query string.

The payment-return UI reads `status === "paid"` for a confirmed payment, `status === "pending"` for processing, and treats other values as not confirmed. Return only a public status, not donor data. A later production implementation should use an opaque return token or suitable session ownership protection rather than expose donor details by session ID. Derive paid from the payment provider and verified events, not URL content.

## Optional homepage slides

`SiteContent.home.slides` is an optional array of up to five additional slides. The first slide continues to use the existing home eyebrow/title/accent/intro/heroImage fields. Each extra slide has id, eyebrow, title, accent, intro, image, link and linkLabel. Links must be local website paths. All slides keep the first-visit main action. Preserve the array during backend storage, imports and publishing. Old schema-1 files without it still validate; the local preview can upgrade legacy bundled images and add the two new default slides. This migration is not applied to published API content.

## Future protected admin endpoints (not wired in this ZIP)

Plan POST /admin/login, POST /admin/logout, GET /admin/me, POST /admin/password/forgot, POST /admin/password/reset, GET/PUT /admin/content, POST /admin/content/publish, POST/DELETE /admin/media and restricted list/detail endpoints for enquiries, event interest, newsletters and donations. Include CSRF/session protection, permission checks, audit events, pagination and revision IDs. The current studio's Save preview remains local even if VITE_API_URL is set; replace that persistence path explicitly when implementing publishing.
