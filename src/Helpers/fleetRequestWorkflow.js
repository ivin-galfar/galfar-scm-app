export const FLEET_APPROVAL_ROLES = {
  STANDARD: ["INITIATOR", "CM", "PM", "HOD", "GM"],
  SPECIAL_PROJECT: ["INITIATOR", "CM", "PM", "PD", "HOD", "GM"],
  NORMAL_PROJECT: ["INITIATOR", "CM", "HOD", "GM"],
};

const includesProject = (projects, project) =>
  (projects ?? []).map(Number).includes(Number(project));

export const getFleetApprovalFlow = (
  project,
  specialProjects = [],
  normalProjects = [],
) => {
  if (includesProject(specialProjects, project)) {
    return FLEET_APPROVAL_ROLES.SPECIAL_PROJECT;
  }
  if (includesProject(normalProjects, project)) {
    return FLEET_APPROVAL_ROLES.NORMAL_PROJECT;
  }
  return FLEET_APPROVAL_ROLES.STANDARD;
};
