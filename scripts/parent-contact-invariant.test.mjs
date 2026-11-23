import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const api = readFileSync(new URL("../src/lib/school/api.ts", import.meta.url), "utf8");
const report = readFileSync(new URL("../src/components/school/public-report.tsx", import.meta.url), "utf8");
const card = readFileSync(new URL("../src/components/school/public-parent-contact.tsx", import.meta.url), "utf8");

test("public parent form is above the report and includes required/optional fields", () => {
  assert.ok(report.indexOf("<PublicParentContact") < report.indexOf("<ReportSheet"));
  assert.match(card, /Parent phone number/);
  assert.match(card, /required/);
  assert.match(card, /Parent name.*optional/i);
  assert.match(card, /Father/);
  assert.match(card, /Mother/);
  assert.match(card, /readOnly/);
});

test("public submission derives the learner from a validated report code", () => {
  assert.match(api, /export const submitPublicParentContact/);
  assert.match(api, /where public_code=\$\{code\} and status='active'/);
  assert.match(api, /insert into guardian_contacts/);
  assert.doesNotMatch(api.slice(api.indexOf("export const submitPublicParentContact"), api.indexOf("export const getParentContactSettings")), /data\.learnerId/);
});

test("staff contact access is server-enforced and setting-controlled", () => {
  assert.match(api, /Only the super admin or deputy super admin can change this setting/);
  assert.match(api, /teachersCanViewParentContacts/);
  assert.match(api, /canViewParentContacts\(me,assignments/);
  assert.match(api, /requireLearnerContactAccess/);
});
