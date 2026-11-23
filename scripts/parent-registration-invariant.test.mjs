import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const api = readFileSync(new URL("../src/lib/school/api.ts", import.meta.url), "utf8");
const route = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const panel = readFileSync(new URL("../src/components/school/parent-registration.tsx", import.meta.url), "utf8");
const staff = readFileSync(new URL("../src/components/school/staff-view.tsx", import.meta.url), "utf8");
const settings = readFileSync(new URL("../src/components/school/settings-view.tsx", import.meta.url), "utf8");

test("parent sign-in exposes phone collection and verification", () => {
  assert.match(route, /ParentRegistration/);
  assert.match(panel, /Contact number/);
  assert.match(panel, /Learner’s Name/);
  assert.match(panel, /verification code/i);
  assert.match(panel, /temporary password/);
  assert.match(panel, /Additional learner name/);
  assert.match(panel, /combinedLearnerName/);
  assert.match(panel, /if \(!result\.ok\)/);
  assert.doesNotMatch(route, /<form onSubmit=\{parentMode \?/);
  assert.match(route, /<div className="w-full max-w-sm">/);
});

test("registration matches one learner and never exposes the verification code", () => {
  assert.match(api, /export const requestParentRegistration/);
  assert.match(api, /findUniqueRegistrationLearner/);
  assert.match(api, /score >= 0\.65/);
  assert.match(api, /LEARNER_NOT_MATCHED/);
  assert.match(api, /LEARNER_AMBIGUOUS/);
  assert.match(api, /tokenScores/);
  assert.match(api, /EMAIL_ALREADY_REGISTERED/);
  assert.match(api, /EMAIL_NOT_SENT/);
  assert.match(api, /export const verifyParentRegistration/);
  assert.match(api, /verification_code_hash/);
  assert.match(api, /temporary_password_hash/);
  assert.match(api, /temporary_password_expires_at/);
  assert.match(api, /interval '10 minutes'/);
  assert.doesNotMatch(api.slice(api.indexOf("export const requestParentRegistration"), api.indexOf("export const verifyParentRegistration")), /return \{[^}]*code/);
});

test("temporary parent login requires a password change before portal access", () => {
  assert.match(api, /password_change_required/);
  assert.match(api, /password_expires_at/);
  assert.match(api, /mustChangePassword/);
  assert.match(route, /Save new password and continue/);
  assert.match(route, /changePassword\(\{ data: \{ current: parentPassword, next: newParentPassword \} \}\)/);
});

test("authorized administrators can edit parent permissions without changing other groups", () => {
  assert.match(api, /function canManageParentAccess/);
  assert.match(api, /me\.role === "admin" && \(me\.isDeputy \|\| me\.privSettings\)/);
  assert.match(api, /me\.role === "super_admin" \? requested : \{ \.\.\.current, parent: requested\.parent \}/);
  assert.match(settings, /canEditParent/);
  assert.match(settings, /group === "parent"/);
});

test("registration logs are restricted to powerful staff", () => {
  assert.match(api, /export const listParentRegistrationLogs/);
  const section = api.slice(api.indexOf("export const listParentRegistrationLogs"), api.indexOf("export const saveRoleAccessPolicy"));
  assert.match(section, /isPowerful\(me\)/);
  assert.match(staff, /Parent registration log/);
  assert.match(staff, /Verification codes and passwords are never displayed/);
});
