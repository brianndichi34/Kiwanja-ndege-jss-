import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { buildSchoolBackupPayload, maybeEmailSchoolBackup } from "@/lib/school/api";
import { randomBytes } from "node:crypto";

export const Route = createFileRoute("/api/cron-backup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret) return Response.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
        if (!process.env.DATABASE_URL) return Response.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
        if (request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const sql = await getSql();
        const payload = await buildSchoolBackupPayload(sql, "vercel-cron");
        const id = `bak_${randomBytes(9).toString("hex")}`;
        await sql`insert into office_backups (id, kind, note, payload, created_by) values (${id}, 'scheduled', 'Automatic daily database snapshot', ${JSON.stringify(payload)}, 'vercel-cron')`;
        await sql`delete from office_backups where kind = 'scheduled' and id not in (select id from office_backups where kind = 'scheduled' order by created_at desc limit 30)`;

        // Optional automatic email copy (daily / weekly / monthly) — does not replace the in-database snapshot.
        let email: { emailed: boolean; reason?: string; results?: Array<{ to: string; sent: boolean; reason?: string }> } = { emailed: false };
        try {
          email = await maybeEmailSchoolBackup(sql, payload, "cron");
        } catch (error) {
          email = { emailed: false, reason: error instanceof Error ? error.message : "email failed" };
        }

        return Response.json({
          ok: true,
          id,
          createdAt: payload.generatedAt,
          learnerCount: payload.tables.learners.length,
          markCount: payload.tables.marks.length,
          email,
        });
      },
    },
  },
});
