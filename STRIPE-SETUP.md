# Activate Stripe donations

The integration already uses server-created Stripe Checkout for GBP one-off and monthly donations. The website redirects to Stripe; no card details are entered into or stored by this application. A publishable key and pre-created Product/Price IDs are not required for this implementation.

## Local development

Keep the secret values in the backend `.env` file only:

```dotenv
STRIPE_SECRET_KEY=YOUR_STRIPE_TEST_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_LOCAL_LISTENER_SIGNING_SECRET
ENABLE_MONTHLY=true
FRONTEND_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:4000/api
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4000
```

The frontend `.env.local` needs only `VITE_API_URL=http://localhost:4000/api`. Restart both processes after changing environment files.

Using the official Stripe CLI, run `stripe login`, then:

```sh
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

Copy that listener's `whsec_` value into backend STRIPE_WEBHOOK_SECRET, then restart the backend. Keep the listener running while testing. Its secret differs from a Dashboard endpoint's secret.

## Hostinger backend

In the Node application environment settings, add STRIPE_SECRET_KEY (initially sk_test_), STRIPE_WEBHOOK_SECRET (whsec_), and ENABLE_MONTHLY=true. Also set FRONTEND_URL to the actual website origin, PUBLIC_API_URL to the public backend URL ending /api, and ALLOWED_ORIGINS to the exact frontend origin (comma-separated if more than one).

Do not paste keys into this guide, GitHub, the CMS, frontend files, or any VITE_ variable. Retain all existing database, email and admin settings. Restart/redeploy the Node application after changing environment variables.

In Stripe Workbench → Webhooks, create an event destination for Your account, using snapshot events. This handler reads `event.data.object`; do not choose thin events. The packaged Stripe SDK uses API version 2026-02-25.clover; use that version for the endpoint's snapshot schema where available.

Endpoint: your actual backend base URL plus `/api/stripe/webhook`. Example only: `https://api.example.org/api/stripe/webhook`. This is the backend endpoint, not the frontend /donate page. If PUBLIC_API_URL already ends /api, append only `/stripe/webhook` to it.

Select these events:

- checkout.session.completed
- checkout.session.async_payment_succeeded
- checkout.session.async_payment_failed
- checkout.session.expired
- invoice.paid
- invoice.payment_failed
- customer.subscription.deleted

Reveal the signing secret for that endpoint and save it as STRIPE_WEBHOOK_SECRET. The webhook and API key must belong to the same Stripe account and test/live environment. There is no need to create a Payment Link for this flow.

Frontend hosting: set `VITE_API_URL` to that same public API URL and rebuild/redeploy. Changing Vite variables takes effect at build time.

## Acceptance test before live payments

1. From the backend folder, run `npm run check-stripe` with its environment loaded. It checks configuration shape only, never credentials with Stripe, and prints no keys.
2. Open `/api/capabilities` on the backend. It should return payments:true. This confirms configuration presence, not key validity or successful payments.
3. Visit /donate and complete a one-off sandbox payment using Stripe's test card 4242 4242 4242 4242, a future expiry and any valid-format test CVC. Never use a real card in the sandbox.
4. Confirm the return page shows a verified payment, the donation appears as paid in the admin inbox, and Stripe shows successful webhook delivery (HTTP 200).
5. Test a monthly donation and check that Stripe creates a subscription. Confirm invoice.paid delivery and the payment record in the admin panel. Test cancellation in Stripe and confirm the subscription is marked cancelled in the admin record.
6. Test cancelling Checkout without payment. A success-page visit or an unpaid Checkout session must never mark a donation paid.
7. Once these pass, configure the live account key (sk_live_) and a separate live webhook endpoint/secret. Recheck webhook delivery and the complete flow with the client's agreement. Sandbox payments do not transfer money.

The current package has not been connected to the client's Stripe account. No client credentials were supplied or tested. Payment records are available in the admin panel; this implementation does not send donation confirmation emails itself. Configure Stripe receipt emails in the client's Dashboard if required.

Official references, checked 8 November 2026:
- https://docs.stripe.com/checkout/quickstart
- https://docs.stripe.com/webhooks
- https://docs.stripe.com/testing
