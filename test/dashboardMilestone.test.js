import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePaperPagesSaved,
  calculateTreesSaved,
  getDashboardTimePeriod,
  getMilestoneStorageKey,
  isManagementUser,
} from "../src/Helpers/dashboardMilestone.js";

test("calculates estimated paper pages saved from the milestone threshold", () => {
  assert.equal(calculatePaperPagesSaved(1000), 105000);
  assert.equal(calculatePaperPagesSaved("1000"), 105000);
  assert.equal(calculatePaperPagesSaved(1000, 120), 120000);
  assert.equal(calculatePaperPagesSaved("invalid"), 0);
});

test("calculates estimated trees saved from paper pages", () => {
  assert.equal(calculateTreesSaved(105000), 13);
  assert.equal(calculateTreesSaved("105000"), 13);
  assert.equal(calculateTreesSaved(10000, 5000), 2);
  assert.equal(calculateTreesSaved("invalid"), 0);
  assert.equal(calculateTreesSaved(105000, 0), 0);
});

test("uses the same morning, afternoon, and evening greeting boundaries", () => {
  assert.equal(getDashboardTimePeriod(new Date(2026, 9, 2, 4, 59)), "evening");
  assert.equal(getDashboardTimePeriod(new Date(2026, 9, 2, 5, 0)), "morning");
  assert.equal(getDashboardTimePeriod(new Date(2026, 9, 2, 12, 0)), "afternoon");
  assert.equal(getDashboardTimePeriod(new Date(2026, 9, 2, 17, 0)), "evening");
});

test("recognizes configured management roles case-insensitively", () => {
  assert.equal(isManagementUser({ role: ["ceo"] }), true);
  assert.equal(isManagementUser({ role: ["PM"] }), true);
  assert.equal(isManagementUser({ role: ["incharge"] }), true);
  assert.equal(isManagementUser({ role: ["inita"] }), false);
});

test("builds a per-user, local-date, and time-period storage key", () => {
  const date = new Date(2026, 9, 2, 8, 0);

  assert.equal(
    getMilestoneStorageKey({ id: 42, email: "ceo@example.com" }, date),
    "milestone_42_2026-10-02_morning",
  );
});

test("falls back to a sanitized username when no user id is available", () => {
  const date = new Date(2026, 9, 2, 13, 0);

  assert.equal(
    getMilestoneStorageKey({ email: "Senior.Manager@example.com" }, date),
    "milestone_senior-manager_2026-10-02_afternoon",
  );
});
