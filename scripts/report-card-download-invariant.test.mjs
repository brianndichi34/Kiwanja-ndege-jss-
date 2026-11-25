import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const dashboard = readFileSync(new URL("../src/components/school/reports-view.tsx", import.meta.url), "utf8");
const pdf = readFileSync(new URL("../src/lib/school/pdf.ts", import.meta.url), "utf8");

test("report card dashboard exposes a download-only public link toggle", () => {
  assert.match(dashboard, /includePublicLink/);
  assert.match(dashboard, /Include public report link/);
  assert.match(dashboard, /When unchecked, downloaded PDFs contain no public URL or QR code/);
  assert.match(dashboard, /publicLink: link/);
});

test("PDF generation conditionally includes the public link and clickable annotation", () => {
  assert.match(pdf, /const includePublicLink = input\.includePublicLink \?\? profile\.showQr/);
  assert.match(pdf, /if \(includePublicLink && profile\.showQr && qr\)/);
  assert.match(pdf, /if \(includePublicLink && input\.publicLink\)/);
  assert.match(pdf, /doc\.link\(34, 81\.5, 150, 5, \{ url: input\.publicLink \}\)/);
});
