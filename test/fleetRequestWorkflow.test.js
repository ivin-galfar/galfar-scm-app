import test from "node:test";
import assert from "node:assert/strict";
import {
  FLEET_APPROVAL_ROLES,
  getFleetApprovalFlow,
} from "../src/Helpers/fleetRequestWorkflow.js";

test("Fleet Request approval flows end with GM", () => {
  assert.deepEqual(FLEET_APPROVAL_ROLES.STANDARD, [
    "INITIATOR",
    "CM",
    "PM",
    "HOD",
    "GM",
  ]);
  assert.deepEqual(FLEET_APPROVAL_ROLES.SPECIAL_PROJECT, [
    "INITIATOR",
    "CM",
    "PM",
    "PD",
    "HOD",
    "GM",
  ]);
});

test("special projects retain PD while standard projects do not", () => {
  assert.deepEqual(getFleetApprovalFlow(7097, [7102]), [
    "INITIATOR",
    "CM",
    "PM",
    "HOD",
    "GM",
  ]);
  assert.deepEqual(getFleetApprovalFlow(7102, [7102]), [
    "INITIATOR",
    "CM",
    "PM",
    "PD",
    "HOD",
    "GM",
  ]);
});
