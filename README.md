# Kiwanja Ndege JSS Portal

Exam analysis, report cards, timetables and parent/learner access for Kiwanja Ndege JSS.

## What is preloaded
* Grade 7 (57 learners), Grade 8 (38) and Grade 9 (46) with Term 2 2026 CAT 1 and CAT 2 marks, taken from the school report sheets.
* Active term: Term 2, 2026.

## Deploy
1. Create a Neon database and copy its connection string.
2. Add the variables in `DEPLOYMENT_ENV_VARIABLES.md` on Vercel.
3. Deploy. The build creates all tables and loads the Term 2 data automatically.
4. Open `https://YOUR-SITE/api/health`. It should say `"ok": true`.
5. Open `https://YOUR-SITE/setup` and create the super admin (email and phone are pre-filled).
6. Sign in, then follow the "Finish setting up your school" card on the dashboard.

## If an old database already has tables
On the first deploy, any old portal tables found in the database are moved (not deleted) into a schema named `legacy_backup_<time>`, so the new tables build cleanly.

Older design notes from the template are kept in `docs/legacy-notes/`.

## End-to-end tests
The Playwright suite covers the Super Admin QR report access workflow, including the lock/unlock choices, the confirmation modal, cancellation without saving, and restoring the original setting. Run it against a test or staging portal with a Super Admin account:

```sh
E2E_BASE_URL=https://YOUR-SITE \
E2E_SUPER_ADMIN_EMAIL=super-admin@example.com \
E2E_SUPER_ADMIN_PASSWORD='your-test-password' \
npm run test:e2e
```

The test restores the original QR access setting after it completes. Without the three `E2E_*` variables, the test is reported as skipped rather than attempting to launch a browser against an unconfigured environment. Install a Playwright browser once on a new machine with `npx playwright install chromium`.
