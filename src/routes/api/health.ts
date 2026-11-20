import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

// Public, read-only deployment check: GET /api/health. Returns no learner data or secrets.
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const checks: Record<string, boolean> = {
          database: false,
          sessionSecret: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32),
          emailConfigured: Boolean(process.env.RESEND_API_KEY),
          backupCron: Boolean(process.env.CRON_SECRET),
        };
        try {
          const sql = await getSql();
          const rows = await sql<{ n: number }>`select count(*)::int as n from school_profile`;
          checks.database = (rows[0]?.n ?? 0) > 0;
        } catch {
          checks.database = false;
        }
        const ok = checks.database && checks.sessionSecret;
        return Response.json({ ok, checks, checkedAt: new Date().toISOString() }, { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } });
      },
    },
  },
});
