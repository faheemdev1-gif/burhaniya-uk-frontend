# Supplied Burhaniya logo

The supplied transparent PNG is included unchanged at public/images/burhaniya-logo.png and public/favicon.png. It replaces the temporary geometric mark in the header, footer, studio and other brand placements. The favicon follows a custom logo saved in admin settings.

Existing backend content with a blank logo automatically uses the supplied asset, so no database reset or backend update is needed. If you have previously selected another custom logo, open /admin, upload this PNG in Images, select it in Brand & contact, Save draft and Publish website. Selecting the default Burhaniya logo option also uses the bundled logo.

This update contains no environment credentials. Keep your current .env.local and Git repository when copying the frontend files. Restart npm run dev after updating; for Vercel, commit/push the update and deploy. Browsers may cache favicons; a hard refresh or closing/reopening the tab may be needed.
