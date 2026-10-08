export const FLEET_APPROVAL_ROLES = {
  STANDARD: ["INITIATOR", "CM", "PM", "HOD", "GM"],
  SPECIAL_PROJECT: ["INITIATOR", "CM", "PM", "PD", "HOD", "GM"],
};

export const getFleetApprovalFlow = (project, specialProjects = []) =>
  specialProjects.map(Number).includes(Number(project))
    ? FLEET_APPROVAL_ROLES.SPECIAL_PROJECT
    : FLEET_APPROVAL_ROLES.STANDARD;
