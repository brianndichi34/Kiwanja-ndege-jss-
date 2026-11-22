import assert from "node:assert/strict";
import test from "node:test";
import { reportLink } from "./model.ts";

test("reportLink always targets the public root route", () => {
  assert.equal(reportLink("https://school.example/portal/", "AbC123"), "https://school.example/?c=abc123");
  assert.equal(reportLink("https://school.example/portal?view=settings", "learner-1"), "https://school.example/?c=learner-1");
});

test("reportLink falls back to the current origin and encodes the code", () => {
  assert.equal(reportLink("", " Ab C123 ", "https://school.example"), "https://school.example/?c=ab%20c123");
});
