# Image rework verification — version 2.1.0

Both production build commands succeeded. All 41 automated tests passed: 22 frontend tests and 19 backend tests.

New coverage includes portable/legacy uploaded URLs, incompatible backend detection, verification failure preventing live commit, upload/verify/commit ordering, replacement of published images despite a diverging draft image URL, preservation of unpublished wording, image assignment/gallery selection, stale revision rejection, transaction rollback, database image persistence and legacy file import.

Backend integration tests use authenticated HTTP requests with SQLite, temporary data, real Sharp image decoding and CSRF checks. They do not modify production data, send external messages or charge payments. MongoDB transaction code was implemented but has not been exercised against the client's MongoDB instance.

The React Images controls and connection status were inspected in the browser with synthetic fixture data. The browser's file-upload gate declined permission, so no successful browser file-picker upload is claimed. The temporary fixture is excluded from the deliverables. Real deployment acceptance still requires an upload through the actual connected frontend/backend.

The public design and content structure are retained. See LIVE-IMAGES-SETUP.md for the matched frontend/backend update and deployment checks.
