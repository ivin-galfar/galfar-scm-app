import test from "node:test";
import assert from "node:assert/strict";
import { getFleetRequestAccess } from "../src/Helpers/fleetRequestPermissions.js";
import { normalizeDateForInput } from "../src/Helpers/fleetRequestDocument.js";
import {
  FLEET_APPROVAL_ROLES,
  getFleetApprovalFlow,
} from "../src/Helpers/fleetRequestWorkflow.js";

const withPermission = (access_level, statement_role = "fl_req") => ({
  permission: { statement_role, allowed_role: "pm", access_level },
});

test("backend dates are normalized for HTML calendar inputs", () => {
  assert.equal(normalizeDateForInput("25-09-2026"), "2026-09-25");
  assert.equal(normalizeDateForInput("25/09/2026"), "2026-09-25");
  assert.equal(normalizeDateForInput("2026-09-25T00:00:00.000Z"), "2026-09-25");
  assert.equal(normalizeDateForInput("2026-09-24T20:00:00.000Z"), "2026-09-25");
  assert.equal(normalizeDateForInput(null), "");
});

test("Fleet Request frontend capability matrix", () => {
  assert.deepEqual(getFleetRequestAccess(withPermission("edit")), {
    canAccess: true,
    canEdit: true,
    canApprove: false,
    canManage: false,
  });
  assert.deepEqual(getFleetRequestAccess(withPermission("view")), {
    canAccess: true,
    canEdit: false,
    canApprove: true,
    canManage: false,
  });
  assert.deepEqual(getFleetRequestAccess(withPermission("manage")), {
    canAccess: true,
    canEdit: true,
    canApprove: true,
    canManage: true,
  });
  assert.deepEqual(getFleetRequestAccess(withPermission("manage", "other")), {
    canAccess: false,
    canEdit: false,
    canApprove: false,
    canManage: false,
  });
  assert.deepEqual(getFleetRequestAccess({}), {
    canAccess: false,
    canEdit: false,
    canApprove: false,
    canManage: false,
  });
});

test("Fleet Request frontend uses CM-first workflows", () => {
  assert.deepEqual(FLEET_APPROVAL_ROLES.STANDARD, [
    "INITIATOR", "CM", "PM", "HOD", "GM", "CEO",
  ]);
  assert.deepEqual(getFleetApprovalFlow(7102, [7102]), [
    "INITIATOR", "CM", "PM", "PD", "HOD", "GM", "CEO",
  ]);
});
