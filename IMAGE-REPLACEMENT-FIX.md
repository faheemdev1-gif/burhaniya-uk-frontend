# Image replacement fix — 2.0.4

“Replace everywhere” updates an existing media selection and its uses in the draft. It does not independently publish the website. The old success message incorrectly told editors to select the image again; the updated message reports the affected placements and explains publishing.

## Changes

- Image cards show where the photograph is used, including gallery albums.
- Replacement updates the homepage, welcome image, additional slides, page images, programme/event/article covers, any selected logo and shared media aliases. Gallery IDs are retained.
- Equivalent relative and absolute URLs from the same origin match. Distinct hosts and query variants are kept separate.
- Only image fields are replaced. Matching text in copy, descriptions or credits is not accidentally rewritten. Replacement photo metadata is updated for aliases of the same image.
- Upload completion applies to the latest editor draft, preserving changes made while waiting for the upload.
- Images includes **Save and publish changes**, alongside the existing separate Save draft and Publish website controls. The button publishes the current complete draft, including other pending edits.
- HTML returned by a wrongly configured API address is rejected instead of being treated as a successful save or publish. Uploads validate the returned image URL, report unsupported formats and files over 5 MB, and time out with a clear message.

## Install

Replace the frontend files with this package, keeping your .env.local, Git metadata and existing environment configuration. Restart npm run dev locally; for the Vercel website, push the changes and redeploy. No backend code update or database reset is required.

In /admin → Images, choose Replace everywhere on the old photograph, select its replacement, wait for the preview and replacement message, then click **Save and publish changes**. Refresh the public website. To set a different photo for just one section, upload it, select it in that section's image field, and save/publish.

A backend connection is still required. Confirm the frontend VITE_API_URL points to the actual running API. For uploaded pictures, the backend PUBLIC_API_URL must use the address visitors can reach; a localhost image URL is suitable only for local development. A thumbnail or error screenshot is needed to identify any deployment-specific problem that remains.

## Verification

- Production frontend build passes.
- 18 frontend regression checks pass, including all media placements, shared gallery references, repeated replacements, preservation of text and unrelated images, and rejection of HTML API responses.
- The 12 existing backend checks pass unchanged.
- A disposable local API test authenticated, uploaded a PNG, fetched the stored WebP, replaced 11 placements, verified draft isolation, published and reloaded the persisted replacement.
- Browser inspection confirmed the public layout remains unchanged. The authenticated file-picker workflow was not exercised in the browser. No changes were made to the user's live Vercel/Hostinger deployment or client images.
