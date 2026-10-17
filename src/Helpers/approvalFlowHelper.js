import { NORMAL_PROJECTS, SPECIAL_PROJECTS } from "../../config/ENV.js";
import { getFleetRequestAccess } from "./fleetRequestPermissions.js";
import { getFleetApprovalFlow } from "./fleetRequestWorkflow.js";

export { FLEET_APPROVAL_ROLES } from "./fleetRequestWorkflow.js";

const normalizeRole = (role) =>
  String(role ?? "")
    .trim()
    .toUpperCase();

const getCurrentRole = (currentApprover) => {
  const role = normalizeRole(
    typeof currentApprover === "string"
      ? currentApprover
      : currentApprover?.role,
  );

  return role.startsWith("INIT") ? "INITIATOR" : role;
};

/**
 * Returns the next role in a Fleet Request approval flow.
 *
 * Normal projects: Initiator -> CM -> HOD -> GM
 * Special projects: Initiator -> CM -> PM -> PD -> HOD -> GM
 * Unlisted projects retain the legacy standard flow through PM.
 *
 * @param {object} fleetRequest Fleet Request containing `project_code` or
 * `projectCode`.
 * @param {string|object} currentApprover Current role string or an approver
 * object containing a `role` property.
 * @returns {string[]} The next role, or an empty array after the GM or when
 * the current role is invalid.
 */
export const getNextFleetApprovalRoles = (fleetRequest, currentApprover) => {
  if (!fleetRequest || typeof fleetRequest !== "object") return [];

  const flow = getFleetApprovalFlow(
    fleetRequest.project,
    SPECIAL_PROJECTS,
    NORMAL_PROJECTS,
  );
  const currentRole = getCurrentRole(currentApprover);
  const currentRoleIndex = flow.indexOf(currentRole);

  if (currentRoleIndex < 0) return [];

  const nextRole = flow[currentRoleIndex + 1];
  return nextRole ? [nextRole] : [];
};

const getUserRoles = (user) => {
  const roles = Array.isArray(user?.role) ? user.role : [user?.role];
  return roles.filter(Boolean).map(normalizeRole);
};

export const canRecallFleetRequest = ({ fleetRequest, user }) => {
  const access = getFleetRequestAccess(user);
  const status = String(fleetRequest?.status ?? "")
    .trim()
    .toLowerCase();

  return access.canEdit && status.startsWith("pending for ");
};

export const getFleetRequestAction = ({
  fleetRequest,
  user,
  isNew = false,
}) => {
  const access = getFleetRequestAccess(user);
  if (isNew) {
    return access.canEdit
      ? {
          action: "create",
          label: "Create Fleet Request",
          nextStatus: "created",
        }
      : null;
  }

  const status = String(fleetRequest?.status ?? "")
    .trim()
    .toLowerCase();
  const userRoles = getUserRoles(user);

  if (status === "created") {
    const [nextRole] = getNextFleetApprovalRoles(fleetRequest, "INITIATOR");
    if (!nextRole) return null;

    return {
      action: "send-for-approval",
      label: "Send for Approval",
      nextStatus: `pending for ${nextRole.toLowerCase()}`,
      disabled: !access.canEdit,
    };
  }

  if (status === "approved") {
    return {
      action: null,
      label: "Approved",
      nextStatus: null,
      disabled: true,
    };
  }

  if (["review", "recalled"].includes(status) && access.canEdit) {
    const [nextRole] = getNextFleetApprovalRoles(fleetRequest, "INITIATOR");
    return nextRole
      ? {
          action: "send-for-approval",
          label: "Resubmit for Approval",
          nextStatus: `pending for ${nextRole.toLowerCase()}`,
          disabled: false,
        }
      : null;
  }

  if (
    status === "rejected" ||
    status === "review" ||
    status === "recalled" ||
    status === "reverted"
  ) {
    return {
      action: null,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      nextStatus: null,
      disabled: true,
    };
  }

  if (!status.startsWith("pending for ")) return null;

  const currentRole = normalizeRole(status.replace("pending for ", ""));
  if (!access.canApprove || !userRoles.includes(currentRole)) {
    return {
      action: null,
      label: `Pending for ${currentRole}`,
      nextStatus: null,
      disabled: true,
    };
  }

  const [nextRole] = getNextFleetApprovalRoles(fleetRequest, currentRole);
  return {
    action: "approve",
    label: nextRole ? `Approve & Send to ${nextRole}` : "Approve",
    nextStatus: nextRole ? `pending for ${nextRole.toLowerCase()}` : "approved",
    disabled: false,
  };
};

export const getFleetRequestApprovalActions = ({ fleetRequest, user }) => {
  const primaryAction = getFleetRequestAction({ fleetRequest, user });
  if (
    !primaryAction ||
    primaryAction.disabled ||
    primaryAction.action !== "approve"
  ) {
    return [];
  }

  return [
    {
      action: "approve",
      label: "Approve",
      nextStatus: primaryAction.nextStatus,
    },
    { action: "reject", label: "Reject", nextStatus: "rejected" },
    {
      action: "review",
      label: "Send for Review",
      nextStatus: "review",
    },
  ];
};
