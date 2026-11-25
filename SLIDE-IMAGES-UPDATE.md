# Frontend 2.1.1 — individual slide photographs

This is a frontend-only update. Keep the working backend 2.1.0, its database and accounts.

Copy the extracted frontend folder CONTENTS into your existing frontend project. Keep .env.local and Git configuration. Stop Vite with Control+C, run npm ci, then npm run dev. Open /admin/home.

At the TOP of Homepage, Homepage slide photographs shows one always-visible card for every existing slide: Slide 1, Slide 2, Slide 3 and any additional slides. Each has its own preview, image selector, Upload for this image and Choose from photo library button. The library picker shows labelled thumbnails. Choose a photograph to apply it to only that slide. The welcome section has its own separate image control.

Direct upload first adds the verified image to the library and then assigns it to the selected placement. These changes are automatic using the existing backend 2.1.0. Other pending wording edits are saved as a draft; they are not published by the image operation. New slides still need Save draft and Publish website to publish their text/structure.

Replace everywhere in Images remains an explicitly global operation. Use the Homepage controls for individual slide changes.

No public design, contact details, content or backend software was changed. All existing slides and photo selections are preserved. Browser upload permission was previously declined, so verification uses production compilation, automated frontend tests and authenticated backend API tests. Actual editing on the client’s Mac remains to be confirmed.
