import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="36" fill="#0e2a4a"/><circle cx="96" cy="82" r="48" fill="#f5c451"/><text x="96" y="101" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#0e2a4a">KNJ</text><text x="96" y="158" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="white">PORTAL</text></svg>`;

export const Route = createFileRoute("/api/app-icon")({
  server: {
    handlers: {
      GET: async () => {
        const sql = await getSql();
        const rows = await sql<{ app_icon_data: string }>`select app_icon_data from welcome_page where id = 1`;
        const value = rows[0]?.app_icon_data || "";
        const match = /^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,([A-Za-z0-9+/=\s]+)$/i.exec(value);
        if (!match) return new Response(FALLBACK_SVG, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=3600" } });
        return new Response(Buffer.from(match[2].replace(/\s/g, ""), "base64"), {
          headers: { "content-type": match[1], "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" },
        });
      },
    },
  },
});
