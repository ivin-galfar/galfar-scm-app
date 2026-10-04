import assert from "node:assert/strict";
import test from "node:test";

import {
  getInitiatorCapabilities,
  getInitiatorCreationOptions,
} from "../src/Helpers/initiatorCapabilities.js";

const cases = [
  [["initfn"], ["filenote"]],
  [["initpr"], ["demob"]],
  [["initdc"], ["hwa"]],
  [["initfr"], ["fleet-request"]],
  [["initfn", "initpr"], ["demob"]],
  [["initfn", "initdc"], ["hwa"]],
  [["initpr", "initdc"], ["demob", "hwa"]],
  [["initpr", "initfr"], ["demob", "fleet-request"]],
  [["initdc", "initfr"], ["hwa", "fleet-request"]],
  [["initfn", "initpr", "initfr"], ["demob", "fleet-request"]],
  [["initfn", "initdc", "initfr"], ["hwa", "fleet-request"]],
  [["initfn", "initpr", "initdc"], ["demob", "hwa"]],
  [
    ["initpr", "initdc", "initfr"],
    ["demob", "hwa", "fleet-request"],
  ],
  [
    ["initfn", "initpr", "initdc", "initfr"],
    ["demob", "hwa", "fleet-request"],
  ],
];

test("initiator creation options apply specialization and fallback rules", () => {
  for (const [roles, expectedKeys] of cases) {
    assert.deepEqual(
      getInitiatorCreationOptions(roles).map((option) => option.key),
      expectedKeys,
      roles.join(" + "),
    );
  }
});

test("common FN/IOC access includes all FN/IOC initiator roles only", () => {
  for (const role of ["initfn", "initpr", "initdc"]) {
    assert.equal(getInitiatorCapabilities([role]).canAccessFNIOC, true);
  }
  assert.equal(getInitiatorCapabilities(["initfr"]).canAccessFNIOC, false);
});

test("general approval roles do not gain initiator capabilities", () => {
  for (const role of ["cm", "pm", "pd", "fm", "hod", "gm", "ceo"]) {
    assert.deepEqual(getInitiatorCreationOptions([role]), []);
  }
});
