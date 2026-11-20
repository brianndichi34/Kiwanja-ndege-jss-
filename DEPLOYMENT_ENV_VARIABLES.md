# Kiwanja Ndege JSS Portal: Vercel environment variables

Add these in Vercel > Project > Settings > Environment Variables (Production), then Redeploy.

| Name | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string. Use `sslmode=verify-full` instead of `sslmode=require` to remove the SSL warning in build logs. |
| `SESSION_SECRET` | Long random secret (32+ characters). |
| `BETTER_AUTH_SECRET` | A different long random secret. |
| `BETTER_AUTH_URL` | Your live address, e.g. `https://your-project.vercel.app` (no trailing slash). |
| `VITE_AUTH_ENABLED` | `true` |
| `CRON_SECRET` | Another random secret (enables the daily automatic backup). |
| `SUPER_ADMIN_EMAIL` | `brianndichi340@gmail.com` (only this email can create the super admin account). |
| `SUPER_ADMIN_PHONE` | `0717276195` |
| `RESEND_API_KEY` | Optional. Needed only to email passwords and timetables. |
| `EMAIL_FROM` | Optional. A sender verified in Resend, e.g. `Kiwanja Ndege JSS Portal <onboarding@resend.dev>` for testing. |

Never put real secrets in the project files or on GitHub.

| `RESEND_API_KEY` | Required for password emails, timetable emails, **and automatic email backups**. |
| `EMAIL_FROM` | Verified Resend sender, e.g. `Kiwanja Ndege JSS Portal <onboarding@resend.dev>` for testing. |

**Automatic email backup:** After deploy, open Settings → Automatic email backup. Default recipient is `brianndichi340@gmail.com`, frequency weekly (Sunday UTC). Daily in-database snapshots continue regardless of this setting.
