# Stripe on-page donations — version 2.2.0

Read DONATION-PAGE-UPDATE.md first. This release uses the genuine Stripe Payment Element on the donation page, backed by server-created Checkout Sessions with ui_mode=custom. It needs STRIPE_PUBLISHABLE_KEY in addition to STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET. Public and secret keys must belong to the same account and test/live mode. The frontend receives the public key through the API. Secrets stay in the backend environment.

The installed Stripe SDK and Stripe.js Clover use the same API release train. Keep their versions aligned if upgrading. The legacy hosted checkout route remains compatible with older clients, but the new donation page uses on-page card entry and does not intentionally send donors to a hosted checkout page. Authentication with a bank and the final verified receipt can still involve redirects.

The webhook URL is your ACTUAL backend URL ending /api/stripe/webhook. Local testing uses stripe listen --forward-to localhost:4000/api/stripe/webhook and its own whsec_ value. Keep the listener running during testing.

Use snapshot events matching the installed SDK's 2026-02-25.clover schema where available:

- checkout.session.completed
- checkout.session.async_payment_succeeded
- checkout.session.async_payment_failed
- checkout.session.expired
- invoice.paid
- invoice.payment_failed
- customer.subscription.deleted

Run npm run check-stripe in the backend to check configuration shape. Then use your own Stripe test account keys to complete one-off and monthly sandbox payments and inspect successful webhook delivery, paid admin records, decline handling and subscription cancellation. The package has not been tested with the client's actual Stripe credentials. Do not enable live payments before sandbox acceptance.

Gift Aid is optional, disabled by default and configured separately with ENABLE_GIFT_AID. It does not increase the amount charged. New donor/declaration records are stored in the existing database and do not automatically subscribe donors to marketing.

Official references:
- https://docs.stripe.com/payments/accept-a-payment?payment-ui=elements&api-integration=checkout
- https://docs.stripe.com/sdks/stripejs-versioning
- https://docs.stripe.com/webhooks
- https://docs.stripe.com/testing
