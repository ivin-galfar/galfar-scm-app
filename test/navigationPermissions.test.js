import test from "node:test";
import assert from "node:assert/strict";

import { getModuleNavigationAccess } from "../src/Helpers/navigationPermissions.js";

test("plant-only users cannot open Logistics navigation", () => {
  assert.deepEqual(
    getModuleNavigationAccess({ dept_code: [1], role: ["inith"] }),
    {
      canAccessPlant: true,
      canAccessLogistics: false,
      canAccessProjects: true,
      canViewProjectsNavigation: true,
      canAccessHiringAsset: true,
      canAccessBuyVsRent: true,
      canAccessTemplates: false,
    },
  );
});

test("logistics initiators and in-charge users cannot open Plant navigation", () => {
  for (const role of ["initlg", "incharge"]) {
    assert.deepEqual(
      getModuleNavigationAccess({ dept_code: [2], role: [role] }),
      {
        canAccessPlant: false,
        canAccessLogistics: true,
        canAccessProjects: role !== "incharge",
        canViewProjectsNavigation: true,
        canAccessHiringAsset: true,
        canAccessBuyVsRent: true,
        canAccessTemplates: false,
      },
    );
  }
});

test("common roles can open both Plant and Logistics navigation", () => {
  for (const role of ["pm", "cm", "fm", "gm", "ceo"]) {
    assert.equal(
      getModuleNavigationAccess({ dept_code: [1], role: [role] })
        .canAccessLogistics,
      true,
    );
    assert.equal(
      getModuleNavigationAccess({ dept_code: [2], role: [role] })
        .canAccessPlant,
      true,
    );
  }
});

test("users assigned to both departments can open both modules", () => {
  assert.deepEqual(
    getModuleNavigationAccess({ dept_code: [1, 2], role: ["hod"] }),
    {
      canAccessPlant: true,
      canAccessLogistics: true,
      canAccessProjects: true,
      canViewProjectsNavigation: true,
      canAccessHiringAsset: true,
      canAccessBuyVsRent: true,
      canAccessTemplates: false,
    },
  );
});

test("PM, CM, PD, and FM users cannot open Hiring / Asset", () => {
  for (const role of ["pm", "cm", "pd", "fm"]) {
    assert.equal(
      getModuleNavigationAccess({ dept_code: [1], role: [role] })
        .canAccessHiringAsset,
      false,
    );
  }
});

test("PM, CM, and PD users cannot open Buy vs Rent", () => {
  for (const role of ["pm", "cm", "pd"]) {
    assert.equal(
      getModuleNavigationAccess({ dept_code: [1], role: [role] })
        .canAccessBuyVsRent,
      false,
    );
  }

  assert.equal(
    getModuleNavigationAccess({ dept_code: [1], role: ["fm"] })
      .canAccessBuyVsRent,
    true,
  );
});

test("templates are available only to administrators", () => {
  assert.equal(
    getModuleNavigationAccess({
      dept_code: [1, 2],
      role: ["gm"],
      is_admin: false,
    }).canAccessTemplates,
    false,
  );
  assert.equal(
    getModuleNavigationAccess({
      dept_code: [1, 2],
      role: ["gm"],
      is_admin: true,
    }).canAccessTemplates,
    true,
  );
});

test("in-charge users cannot open Projects", () => {
  assert.equal(
    getModuleNavigationAccess({ dept_code: [2], role: ["incharge"] })
      .canAccessProjects,
    false,
  );
});

test("FM users see Projects locked and cannot open it", () => {
  const access = getModuleNavigationAccess({
    dept_code: [1, 2],
    role: ["fm"],
  });

  assert.equal(access.canAccessProjects, false);
  assert.equal(access.canViewProjectsNavigation, true);
});

test("project and document-control initiators cannot open Plant", () => {
  for (const role of ["initpr", "initdc"]) {
    assert.equal(
      getModuleNavigationAccess({ dept_code: [1], role: [role] })
        .canAccessPlant,
      false,
    );
  }
});

