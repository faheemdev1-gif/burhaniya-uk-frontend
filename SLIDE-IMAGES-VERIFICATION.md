# Individual slide photographs — frontend 2.1.1 verification

Production TypeScript/Vite build passed. All 26 frontend tests and 20 backend API tests passed. The backend runtime remains version 2.1.0; only an additional compatibility test was needed there, so no backend update is required.

The actual React Homepage admin was rendered through Vite SSR. The check verifies that three slide photo cards, three independent upload controls and the separate welcome image control appear outside collapsed wording panels. Functional tests verify stable slide IDs, library-save-before-assignment and no assignment after a failed save. Authenticated HTTP tests change slides 2 and 3 individually and verify that the first slide, welcome section, article images, page images, gallery selections and unpublished slide wording remain unchanged.

Public page source, public styling, seed content and HeroSlider source match frontend 2.1.0 exactly. Existing CMS content is not reset or rewritten by installing this update.

This session did not verify a browser file-picker upload or the application running on the client's Mac. Follow SLIDE-IMAGES-UPDATE.md and confirm one slide image change locally.
