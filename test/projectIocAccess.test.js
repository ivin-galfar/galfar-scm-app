import assert from "node:assert/strict";
import test from "node:test";

import { getProjectIocAccess } from "../src/Helpers/projectIocAccess.js";

test("project approvers are limited to Demob and HWA", () => {
  const access = getProjectIocAccess({ role: ["cm", "initfn"] });

  assert.equal(access.canAccess, true);
  assert.equal(access.isProjectScoped, true);
  assert.deepEqual(access.allowedCategories, ["Demob", "FWA"]);
  assert.equal(access.defaultCategory, "Demob");
});

test("project initiator category access follows the existing role", () => {
  assert.deepEqual(getProjectIocAccess({ role: ["initpr"] }).allowedCategories, [
    "Demob",
  ]);
  assert.deepEqual(getProjectIocAccess({ role: ["initdc"] }).allowedCategories, [
    "FWA",
  ]);
});

test("broader FN/IOC roles remain unrestricted", () => {
  const access = getProjectIocAccess({ role: ["gm", "initpr"] });

  assert.equal(access.canAccess, true);
  assert.equal(access.isProjectScoped, false);
  assert.equal(access.allowedCategories, null);
});
