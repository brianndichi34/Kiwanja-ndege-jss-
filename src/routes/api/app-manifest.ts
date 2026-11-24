import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/app-manifest")({
  server: {
    handlers: {
      GET: async () => {
        const sql = await getSql();
        const rows = await sql<{ title: string; app_icon_revision: number }>`select title, app_icon_revision from welcome_page where id = 1`;
        const title = rows[0]?.title?.trim() || "Kiwanja Ndege Portal";
        const revision = Math.max(1, Number(rows[0]?.app_icon_revision || 1));
        return Response.json({ name: title, short_name: "Kiwanja Ndege", description: "Kiwanja Ndege Junior Secondary School portal", start_url: "/", scope: "/", display: "standalone", orientation: "portrait-primary", theme_color: "#0e2a4a", background_color: "#0e2a4a", icons: [{ src: `/api/app-icon?v=${revision}&size=192`, sizes: "192x192", type: "image/png", purpose: "any maskable" }, { src: `/api/app-icon?v=${revision}&size=512`, sizes: "512x512", type: "image/png", purpose: "any maskable" }] }, { headers: { "content-type": "application/manifest+json", "cache-control": "no-cache, max-age=0, must-revalidate" } });
      },
    },
  },
});
