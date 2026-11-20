# Live image updates — version 2.1.0

Update BOTH repositories to the matching 2.1.0 packages. Keep your existing .env, .env.local, Git configuration, database and data/uploads directory. Copy the extracted folder CONTENTS into the matching repository; do not add another nested project folder. Install dependencies with npm ci and restart/redeploy both applications. Do not run create-admin again for an existing account.

## What changes

- Replace everywhere previews the chosen photo immediately, optimises it, uploads it, checks that it loads and then automatically applies the image to its existing live placements.
- Selecting a page image or changing photos in an existing gallery album also applies that image selection automatically. Adding an image to the library does not place it on a page.
- Image operations save your current draft, including any pending text edits, but publish only the image change. Text, layout, new entries and new albums still use Save draft and Publish website.
- Foreground public website tabs check for published changes every three seconds. Other tabs in the same browser receive an immediate update signal; returning to a background tab refreshes it. Offline visitors cannot receive updates until they reconnect.
- Unsupported files, missing images and revision conflicts produce a visible error. A photo that fails the loading check is not applied to the live website.
- Each new upload has a unique URL to avoid stale browser caches. Stored image links are portable and resolved using the frontend API configuration.

## Running locally

Use Node.js 24. In the BACKEND folder, preserve your existing .env or copy .env.example to .env. The relevant local settings are:

```dotenv
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:4000/api
ALLOWED_ORIGINS=http://localhost:4000,http://localhost:5173
MONGODB_URI=
SQLITE_PATH=./data/site.sqlite
```

Run npm ci, then npm start in that backend folder. Keep that terminal running. SQLite is created automatically; there is no separate local database server to install. Existing accounts and content remain in your existing database.

In the FRONTEND folder, set .env.local:

```dotenv
VITE_API_URL=http://localhost:4000/api
```

Run npm ci, then npm run dev in a second terminal. Restart Vite whenever you change this variable. The default /api setting also works through the included Vite development proxy. Use the same hostname consistently: do not mix localhost and 127.0.0.1 in your frontend URLs and allowed origins.

## Hostinger backend and Vercel frontend

The production backend requires MONGODB_URI and MONGODB_DB. Use a MongoDB deployment that supports transactions, such as an Atlas replica set. New image bytes and content are saved in the SAME database; there is no separate image database to link. Your connection string is private and belongs only in the backend environment.

Keep the other variables in hostinger.env.example, including FRONTEND_URL and ALLOWED_ORIGINS set to your exact frontend origin. Set PUBLIC_API_URL to your actual HTTPS backend URL ending in /api.

In Vercel set VITE_API_URL to that same actual backend API URL, for example https://YOUR-BACKEND-DOMAIN/api. This is a placeholder, not your known backend address. Redeploy Vercel after changing it: this variable is compiled into the frontend. Running a backend on your laptop does not connect the public Vercel website to it.

Prefer frontend and API subdomains on the same registered domain for reliable admin cookies. If using unrelated vercel.app and Hostinger domains, COOKIE_SAME_SITE=none with HTTPS may be required, and third-party cookie restrictions can still prevent login. Do not change authentication settings blindly; follow the backend README for the deployment.

## Confirm the connection

1. Open your actual backend URL followed by /api/health. Expect ok=true, version=2.1.0, mediaVersion=2 and mediaStorage=database. A website HTML page here means this is not the running backend API.
2. Open the admin Images section. Check connection should identify Backend 2.1.0, the database and image storage. If it asks for a backend update, the old backend is still running.
3. Replace a photo with a JPG, PNG or WebP up to 15 MB. HEIC must first be converted to JPG. Wait for the success message and updated thumbnail. No separate image publish button is needed.
4. Open the public page in another tab. It should update within a few seconds. Check again after restarting/redeploying the backend to confirm persistence.
5. If it fails, copy the visible error and API address shown in Images. Do not share passwords, API keys or database credentials.

## Existing files and backups

Old /media image URLs remain supported. When a legacy file is requested, the backend reads it from MEDIA_DIR and imports it into the database. Keep the existing uploads folder until all old images have been migrated and checked. If an old file has already been lost, upload the original photograph again; a software update cannot recover deleted bytes.

Back up the database, which now contains new uploaded images, together with any remaining legacy uploads. Never replace your production database with seed.json or the test database. Failed upload attempts can leave an unused image record, but they do not replace the live page image.

## Verification and limits

The package includes automated tests for SQLite image persistence, legacy file import, image-only publishing, revision conflicts/rollback, URL resolution and upload/verify/commit ordering. Builds and local API tests do not verify your actual Hostinger account or MongoDB deployment. The browser controls and connection status were inspected with synthetic fixture data; the browser file-picker upload could not be completed because upload permission was declined. Complete the deployment checks above with your actual API URL before relying on production editing.
