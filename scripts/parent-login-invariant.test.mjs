import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const route = readFileSync(join(root, "src/routes/index.tsx"), "utf8");
const api = readFileSync(join(root, "src/lib/school/api.ts"), "utf8");

test("parent sign-in exposes the dedicated Mukuyu-style controls", () => {
  assert.match(route, /Sign in as PARENTS/);
  assert.match(route, /Your email address/);
  assert.match(route, /Parent portal password/);
  assert.match(route, /Sign in to parent portal/);
  assert.match(route, /Create a parent account/);
  assert.match(route, /Forgot or reset parent password\?/);
  assert.match(route, /parentPasswordVisible/);
  assert.match(route, /loginAsParent\(\{ data: \{ email: parentEmail, password: parentPassword \} \}\)/);
});

test("normal sign-in remains wired to the unrestricted login action", () => {
  assert.match(route, /await login\(\{ data: \{ email, password \} \}\)/);
  assert.match(route, /onSubmit=\{parentMode \? \(parentMustChangePassword \? onParentPasswordChange : onParentSubmit\) : onSubmit\}/);
});

test("parent login is enforced server-side and uses a generic mismatch error", () => {
  assert.match(api, /export const loginAsParent = createServerFn/);
  assert.match(api, /authenticate\(data\.email, data\.password, "parent"\)/);
  assert.match(api, /if \(requiredRole && asRole\(row\.role\) !== requiredRole\) throw new Error\("Email or password is not correct\."\)/);
  assert.match(api, /password_change_required/);
});
