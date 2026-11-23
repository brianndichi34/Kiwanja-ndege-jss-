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
  assert.match(api, /if \(isPowerful\(me\)\) return true/);
  assert.match(api, /requireLearnerContactAccess\(sql,me,data\.learnerId\)/);
});
