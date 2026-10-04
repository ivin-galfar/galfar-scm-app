import test from "node:test";
import assert from "node:assert/strict";

import { getDashboardStatusTabClass } from "../src/Helpers/dashboardStatusNav.js";

test("dashboard status tabs use the Fleet Request active colors", () => {
  const expectedColors = {
    All: "bg-blue-600",
    Approved: "bg-emerald-600",
    Rejected: "bg-rose-600",
    Pending: "bg-amber-600",
    "Under Review": "bg-cyan-600",
  };

  for (const [tab, colorClass] of Object.entries(expectedColors)) {
    const classes = getDashboardStatusTabClass(tab, true);
    assert.match(classes, new RegExp(`\\b${colorClass}\\b`));
    assert.match(classes, /\btext-white\b/);
  }
});

test("inactive dashboard status tabs retain status-aware hover colors", () => {
  assert.match(
    getDashboardStatusTabClass("Approved", false),
    /hover:text-emerald-800/,
  );
  assert.match(
    getDashboardStatusTabClass("Under Review", false),
    /hover:text-cyan-700/,
  );
});
