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
      canAccessFNIOC: true,
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
        canAccessFNIOC: false,
        canAccessHiringAsset: true,
        canAccessBuyVsRent: true,
        canAccessTemplates: false,
      },
    );
  }
});

test("unrestricted common roles can open both Plant and Logistics navigation", () => {
  for (const role of ["hod", "fm", "gm", "ceo"]) {
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

test("PM, PD, and CM cannot open the general Plant module", () => {
  for (const role of ["pm", "pd", "cm"]) {
    const access = getModuleNavigationAccess({
      dept_code: [1],
      role: [role, "initfn"],
    });

    assert.equal(access.canAccessPlant, false);
    assert.equal(access.canAccessProjects, true);
  }
});

test("CM cannot open Logistics", () => {
  for (const departmentCodes of [[1], [2], [1, 2]]) {
    assert.equal(
      getModuleNavigationAccess({
        dept_code: departmentCodes,
        role: ["cm", "initfn"],
      }).canAccessLogistics,
      false,
    );
  }
});

test("CM and PM cannot open general Plant FN/IOC", () => {
  for (const role of ["cm", "pm"]) {
    assert.equal(
      getModuleNavigationAccess({ dept_code: [1], role: [role] })
        .canAccessFNIOC,
      false,
    );
  }
});

test("CM and PM retain an FN/IOC capability when combined with an eligible role", () => {
  for (const roles of [
    ["cm", "initfn"],
    ["pm", "hod"],
  ]) {
    assert.equal(
      getModuleNavigationAccess({ dept_code: [1], role: roles })
        .canAccessFNIOC,
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
      canAccessFNIOC: true,
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

test("Fleet Request-only initiators cannot open Plant", () => {
  assert.equal(
    getModuleNavigationAccess({ dept_code: [1], role: ["initfr"] })
      .canAccessPlant,
    false,
  );
});

test("Fleet Request initiators retain Plant access with a Plant initiator role", () => {
  for (const role of ["inith", "inita"]) {
    assert.equal(
      getModuleNavigationAccess({ dept_code: [1], role: [role, "initfr"] })
        .canAccessPlant,
      true,
    );
  }
});

test("Fleet Request initiators retain Plant access with a common approval role", () => {
  assert.equal(
    getModuleNavigationAccess({ dept_code: [1], role: ["gm", "initfr"] })
      .canAccessPlant,
    true,
  );
});

test("standalone initfn users cannot open Hiring / Asset, Buy vs Rent, or Projects", () => {
  const access = getModuleNavigationAccess({
    dept_code: [1],
    role: ["initfn"],
  });

  assert.equal(access.canAccessPlant, true);
  assert.equal(access.canAccessHiringAsset, false);
  assert.equal(access.canAccessBuyVsRent, false);
  assert.equal(access.canAccessProjects, false);
});

test("initfn does not restrict modules when combined with another role", () => {
  const access = getModuleNavigationAccess({
    dept_code: [1],
    role: ["initfn", "inita"],
  });

  assert.equal(access.canAccessHiringAsset, true);
  assert.equal(access.canAccessBuyVsRent, true);
  assert.equal(access.canAccessProjects, true);
});

