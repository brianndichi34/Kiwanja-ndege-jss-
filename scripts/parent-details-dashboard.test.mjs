import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const api = fs.readFileSync("src/lib/school/api.ts", "utf8");
const staff = fs.readFileSync("src/components/school/staff-view.tsx", "utf8");
const services = fs.readFileSync("src/components/school/school-services-view.tsx", "utf8");

test("registration details return the linked learner name without exposing credentials", () => {
  assert.match(api, /left join learners l on l\.id=r\.matched_learner_id/);
  assert.match(api, /l\.full_name as "matchedLearnerName"/);
  assert.match(staff, /row\.matchedLearnerName \?\? "—"/);
  assert.match(staff, /Parent registration log and details/);
  assert.match(staff, /a reset password is previewed once/);
  assert.doesNotMatch(api.slice(api.indexOf("export const listParentRegistrationLogs"), api.indexOf("export const resolveParentRegistration")), /verification_code_hash|password_hash/);
});

test("parent phone details resolve each contact to the correct learner", () => {
  assert.match(api, /guardianContacts = contactRows\.filter/);
  assert.match(api, /learners\.some\(\(l\) => l\.id === learnerId/);
  assert.match(services, /learners\.find\(\(l\) => l\.id === contact\.learnerId\)\?\.fullName/);
  assert.match(services, /Parent phone directory/);
  assert.match(services, /canViewParentContacts/);
});

test("parent detail access remains restricted server-side", () => {
  const resetApi = api.slice(api.indexOf("export const resetParentPassword"), api.indexOf("export const listMail"));
  assert.match(resetApi, /if \(!isPowerful\(me\)\)/);
  assert.match(api, /requireLearnerContactAccess\(sql,me,data\.learnerId\)/);
});

test("parent password reset returns a one-time credential for the admin preview", () => {
  const resetApi = api.slice(api.indexOf("export const resetParentPassword"), api.indexOf("export const listMail"));
  assert.match(resetApi, /if \(!isPowerful\(me\)\)/);
  assert.match(resetApi, /temporaryPassword/);
  assert.match(resetApi, /expiresAt: expiresAt\.toISOString\(\), temporaryPassword/);
  assert.match(staff, /Temporary parent password preview/);
  assert.match(staff, /navigator\.clipboard\.writeText\(issuedParentCredential\.password\)/);
  assert.match(staff, /Hide password/);
});
