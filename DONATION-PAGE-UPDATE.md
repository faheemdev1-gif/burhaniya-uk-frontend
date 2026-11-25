# Donation page update — version 2.2.0

This release includes the individual slide controls from frontend 2.1.1 and database-backed images from backend 2.1.0.

## Install locally

Update BOTH the frontend and backend from these matching 2.2.0 packages. Extract each ZIP and copy the folder CONTENTS into the corresponding existing project. Keep the frontend .env.local, backend .env, existing data folder (including SQLite, WAL/SHM files and legacy uploads), and Git configuration. Back up the data folder with the backend stopped before updating. Do not delete the database or run create-admin for an existing account.

Stop each process with Control+C. In the backend folder run npm ci, then npm start. Keep it running. In the frontend folder run npm ci, then npm run dev. Open http://localhost:5173/donate. The frontend .env.local can use VITE_API_URL=/api with the supplied development proxy. Keep using Node.js 24.

Check http://localhost:4000/api/health: version should be 2.2.0. A newly opened terminal must be in the updated backend folder; a different folder can start a different SQLite database.

## Stripe keys for on-page card entry

Keep these in the BACKEND .env only:

```dotenv
STRIPE_SECRET_KEY=YOUR_EXISTING_STRIPE_TEST_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=YOUR_MATCHING_STRIPE_TEST_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=YOUR_EXISTING_LOCAL_WEBHOOK_SIGNING_SECRET
ENABLE_MONTHLY=true
FRONTEND_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:4000/api
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4000
```

STRIPE_PUBLISHABLE_KEY is the new required setting. It starts pk_test_ or pk_live_. Use the same Stripe account and test/live mode as STRIPE_SECRET_KEY. Never send secret keys or the complete .env in chat. The publishable key is intentionally made available to the browser through /api/capabilities; the secret and webhook keys remain private. No VITE_STRIPE_SECRET_KEY is used or permitted.

Restart the backend after editing .env. Run npm run check-stripe to check key shapes and mode alignment. This does not verify account ownership or credentials with Stripe. /api/capabilities should report donationVersion=2, paymentUI=custom and payments=true when configuration is present. With incomplete configuration the form remains visible but payment is disabled.

Card entry uses Stripe's genuine Payment Element on this page, not imitation card inputs. Stripe.js Clover is loaded directly from js.stripe.com and matches the installed Stripe server SDK's Clover API release train. The server creates a Checkout Session using ui_mode=custom. The application does not receive or store raw card numbers or CVCs. Available payment methods depend on the Stripe account, donor, browser and registered domain; Google Pay is not guaranteed to appear for every visitor.

Amount changes reload the secure payment element after a short delay. The donation summary reads and checks the Stripe session's GBP total. Before Donate now confirms the payment, donor details and any Gift Aid declaration are saved to the database. Required form fields and Stripe validation must pass. Bank authentication can still open a bank/verification screen. After payment, the return page checks the payment with the backend; a click or return-page visit does not mark a donation paid.

## Webhooks and sandbox acceptance

Keep the existing verified webhook handler. For local testing, run the official Stripe CLI listener in another terminal:

```sh
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

Use the listener's whsec_ value locally. Dashboard webhook signing secrets and CLI listener secrets are different. The handler uses snapshot events compatible with the installed SDK/API schema. See STRIPE-SETUP.md for the event list.

Use your own Stripe sandbox/test keys and complete a sandbox payment, then confirm the return page and admin record show paid and the webhook returns 200. Also test a declined card, monthly subscription, required address validation and changes to the selected amount. No payment has been made using the client's account during development. Do not enable live keys until this acceptance test passes.

## Gift Aid

The Declaration section includes a separate privacy explanation. Gift Aid is OPTIONAL and is never preselected. It is disabled by default. Only after the charity confirms it is entitled to claim Gift Aid, add ENABLE_GIFT_AID=true to the backend .env and restart it. This setting enables the declaration for UK residential addresses in this implementation; donors using other countries can still donate without Gift Aid.

The application stores the chosen declaration's wording, version, date, charity, donor name and home address with the donation. The monthly declaration covers that monthly instruction; it does not automatically cover unrelated future gifts. Records marked created are not paid donations. This software does not submit Gift Aid claims to HMRC. The charity must review eligibility and manage declaration records/retention. Official guidance: https://www.gov.uk/claim-gift-aid/gift-aid-declarations .

## Change photographs and wording

Open Admin → Donation page. Donation banner and Donation form photograph have independent upload and visual library controls. Changing one does not replace the homepage or slides. Initial photographs are existing illustrative assets; replace them with approved client photographs.

Prominent donation labels and wording are available in Admin → Website wording under donation.*. Text edits retain the normal Save draft / Publish website workflow. Gift Aid tax wording is fixed in code so the displayed declaration matches the recorded version. Existing site contacts, homepage content, client uploads, accounts and navigation are retained.

Donor name, email, address and declaration are visible only in the authenticated Inbox & donations records. There is no automatic marketing subscription. Existing Stripe receipt settings and email configuration remain separate.

## Production

Update both repositories/deployments. Keep your existing MongoDB connection and other environment variables. Add the matching public key to the backend environment. Use HTTPS, your actual frontend origin and API address, and register applicable wallet/payment domains in Stripe. Vercel VITE_API_URL still points to the actual backend /api address; redeploy after changing a Vite variable. Review the live page and complete Stripe sandbox acceptance before enabling live payments.

## Verification

Both production builds and 54 automated tests passed: 30 frontend and 24 backend. Coverage includes the real React donation form's rendered structure, exact totals, donor-save-before-Stripe-confirm ordering, declined-card handling, custom Checkout parameters, monthly mode, declaration validation/storage, key-mode mismatch, image independence, existing admin authentication and signed webhook handling.

The browser preview was inspected with synthetic local CMS data and no Stripe credentials. Amount presets, custom amount summary, monthly explanation, country changes and unchecked Gift Aid were verified. Real Stripe payment fields and a successful payment could not be verified without the client's matching test keys. MongoDB and Hostinger deployment were not exercised. The temporary preview API and data are excluded from the ZIPs.
