# Kiwanja Ndege JSS Portal — updated with Mukuyu-3 developments

This package takes the latest feature set from mukuyu-3 and applies the additive timetable upgrades to Kiwanja Ndege JSS while preserving:

- Kiwanja Ndege branding, names, logo, favicon and OG image
- Kiwanja-specific school profile, motto and head teacher
- Preloaded Grade 7 / 8 / 9 learners and Term 2 (and Term 3) 2026 marks
- Single-stream (North) layout migration
- Super-admin email/phone and deployment variable guidance
- Public `/api/health` endpoint
- **Automatic email backup** (settings, migration 0031, recipients, frequency) — unchanged from previous Kiwanja package

## New / upgraded from mukuyu-3 (additive)

- **Double-lesson & pre-break limits** (migration 0032)
  - `subject_constraints.double_count` — null = follow lesson card, 0 = never double, n = exactly n doubles per week
  - `subject_constraints.max_before_break` — max lessons a class may have in the two periods immediately before a break (default 3)
- **Teacher minimum periods per day** (migration 0033)
  - `teacher_contracts.min_per_day` — when a teacher teaches on a day, require at least this many periods (default 0)
- Updated timetable engine with `applyDoubleRule`, `preBreakSorts`, enforcement of the new rules, and richer generation feedback
- Model types and API selects / generator mapping updated for the new columns
- `saveTeacherContract` accepts `minPerDay`

## Migration order

- 0002–0026: core + previous features
- 0027: timetable teacher rest
- 0028–0030: Kiwanja Term 2 / Term 3 data and single-stream North
- 0031: email backup settings (**unchanged**)
- 0032: timetable double & pre-break
- 0033: timetable teacher min per day

## Deploy notes

1. Prefer a fresh Neon database (or accept that first deploy will move any old portal tables into `legacy_backup_*`).
2. Set the environment variables listed in `DEPLOYMENT_ENV_VARIABLES.md`.
3. Deploy the whole folder. Migrations run in order and load the Kiwanja Term 2 data.
4. Verify `https://YOUR-SITE/api/health` returns `"ok": true`.
5. Create the super admin at `/setup`, then finish school setup from the dashboard.

Existing live learner marks and settings in a production database are **not** overwritten by the data migrations if the tables already contain rows. Migrations 0032/0033 only add columns with safe defaults.

## Automatic email backup (unchanged)

- Settings section **Automatic email backup** (super admin only).
- Options: enable/disable, frequency (daily / weekly / monthly), recipient list (default `brianndichi340@gmail.com`), optional email-on-manual-export.
- Daily in-database cron snapshots are unchanged. Email is an extra off-site copy via Resend.
- Requires `RESEND_API_KEY` and `EMAIL_FROM` on Vercel.
