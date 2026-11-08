# Burhaniya UK frontend 2.0.1

Complete standalone React frontend for Vercel, including the connected admin panel, gallery, articles, event enquiries and Stripe donation interface. Use the standalone Hostinger backend 2.0.1 separately.

## GitHub and Vercel

Create a private repository named burhaniya-uk-frontend. Push the contents of this folder so package.json is at the repository root. In Vercel choose Vite, Node 24, root directory repository root, build command npm run build and output directory dist.

Add VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api in Vercel before deployment and redeploy after changing it. Set the backend FRONTEND_URL and ALLOWED_ORIGINS to the exact frontend origin. The administrator signs in at your frontend /admin URL. Use same-site custom domains for the frontend and API as explained in the backend README.

## Run locally

Install Node 24. Start the backend on port 4000, then run npm ci and npm run dev in this folder. Vite proxies /api and /media to the local backend. To use a remote backend instead, create .env.local containing VITE_API_URL with its HTTPS /api URL, restart Vite and allow your local frontend origin on the backend.

## Content and payments

Save draft stores edits on the backend. Publish website makes them public. Events, articles, albums, photographs, page copy, homepage slides and supporting website wording are managed from /admin. Backend administrator creation, MongoDB, persistent uploads, email and Stripe credentials are configured in the separate Hostinger backend. Never put secret keys in a VITE_ variable.

The dist folder contains the compiled build made with the default same-origin /api path. For Vercel/Hostinger split hosting, set VITE_API_URL and rebuild; uploading the existing dist unchanged will not point it at a separate API host.

Production build and frontend regression checks passed in the fullstack release. Browser testing of the new connected admin/gallery was blocked by the managed preview environment. Real payments and email delivery require backend configuration and acceptance testing.

## Logo update

Your supplied transparent logo is now bundled unchanged. See LOGO-UPDATE.md. Keep your existing .env.local and Git repository when copying these updated frontend files. No backend update or database reset is required.

UK English is explicitly set with en-GB language/date/number formatting. See UK-ENGLISH.md.

## Version 2.0.3 — content review, original public structure

The original public layout, navigation, slideshow, section order and entry titles are retained. See CONTENT-UPDATE.md for source grounding and the optional admin draft refresh. Existing published CMS content is preserved until reviewed, saved and published. Stripe setup remains in STRIPE-SETUP.md.
