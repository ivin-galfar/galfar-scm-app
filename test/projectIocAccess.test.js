import assert from "node:assert/strict";
import test from "node:test";

import {
  getFnIocDashboardPath,
  getProjectIocAccess,
  getProjectIocCategoryOptions,
} from "../src/Helpers/projectIocAccess.js";

test("FN/IOC dashboard destination follows general or project scope", () => {
  for (const role of ["cm", "pm", "pd"]) {
    assert.equal(
      getFnIocDashboardPath({ role: [role, "initfn"] }),
      "/dashboardfn?view=projects-ioc",
    );
  }

  assert.equal(
    getFnIocDashboardPath({ role: ["initfn"] }),
    "/dashboardfn",
  );
});

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
  assert.equal(getProjectIocAccess({ role: ["initpr"] }).canAccessDemob, true);
  assert.equal(getProjectIocAccess({ role: ["initpr"] }).canAccessHwa, false);
  assert.deepEqual(getProjectIocAccess({ role: ["initdc"] }).allowedCategories, [
    "FWA",
  ]);
  assert.equal(getProjectIocAccess({ role: ["initdc"] }).canAccessDemob, false);
  assert.equal(getProjectIocAccess({ role: ["initdc"] }).canAccessHwa, true);
});

test("broader FN/IOC roles remain unrestricted", () => {
  const access = getProjectIocAccess({ role: ["gm", "initpr"] });

  assert.equal(access.canAccess, true);
  assert.equal(access.isProjectScoped, false);
  assert.equal(access.allowedCategories, null);
  assert.deepEqual(access.navigationCategories, ["Demob", "FWA"]);
});

test("HWA navigation is limited to initdc and HWA approvers", () => {
  for (const role of ["initdc", "cm", "pm", "pd", "gm"]) {
    assert.equal(getProjectIocAccess({ role: [role] }).canAccessHwa, true);
  }

  for (const role of [
    "initpr",
    "initfn",
    "inith",
    "inita",
    "hod",
    "fm",
    "ceo",
    "view",
  ]) {
    assert.equal(getProjectIocAccess({ role: [role] }).canAccessHwa, false);
  }
});

test("Project IOC dropdown excludes general FN/IOC categories", () => {
  const categories = ["Insurance", "Demob", "PR", "FC", "DPR", "FWA"];

  assert.deepEqual(getProjectIocCategoryOptions(categories), ["Demob", "FWA"]);
  assert.deepEqual(getProjectIocCategoryOptions(categories, ["Demob"]), [
    "Demob",
  ]);
  assert.deepEqual(getProjectIocCategoryOptions(categories, ["FWA"]), [
    "FWA",
  ]);
});
