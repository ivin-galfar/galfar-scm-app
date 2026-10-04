import { getInitiatorCapabilities } from "./initiatorCapabilities.js";

const COMMON_MODULE_ROLES = ["pm", "hod", "cm", "fm", "gm", "ceo"];
const HIRING_ASSET_RESTRICTED_ROLES = ["pm", "cm", "pd", "fm"];
const BUY_VS_RENT_RESTRICTED_ROLES = ["pm", "cm", "pd"];
const PLANT_RESTRICTED_ROLES = ["initpr", "initdc"];
const PROJECTS_RESTRICTED_ROLES = ["incharge", "fm"];

const normalizeValues = (value) =>
  (Array.isArray(value) ? value : [value])
    .filter((item) => item !== undefined && item !== null)
    .map((item) => String(item).trim().toLowerCase());

export const getModuleNavigationAccess = (userInfo) => {
  if (!userInfo) {
    return {
      canAccessPlant: true,
      canAccessLogistics: true,
      canAccessProjects: true,
      canViewProjectsNavigation: true,
      canAccessFNIOC: true,
      canAccessHiringAsset: true,
      canAccessBuyVsRent: true,
      canAccessTemplates: false,
    };
  }

  const roles = normalizeValues(userInfo.role);
  const departmentCodes = normalizeValues(userInfo.dept_code);
  const isCommonUser = roles.some((role) => COMMON_MODULE_ROLES.includes(role));
  const initiatorCapabilities = getInitiatorCapabilities(roles);

  return {
    canAccessPlant:
      !roles.some((role) => PLANT_RESTRICTED_ROLES.includes(role)) &&
      (isCommonUser || departmentCodes.includes("1")),
    canAccessLogistics: isCommonUser || departmentCodes.includes("2"),
    canAccessProjects: !roles.some((role) =>
      PROJECTS_RESTRICTED_ROLES.includes(role),
    ),
    canViewProjectsNavigation: true,
    canAccessFNIOC:
      initiatorCapabilities.canAccessFNIOC ||
      isCommonUser ||
      departmentCodes.includes("1"),
    canAccessHiringAsset: !roles.some((role) =>
      HIRING_ASSET_RESTRICTED_ROLES.includes(role),
    ),
    canAccessBuyVsRent: !roles.some((role) =>
      BUY_VS_RENT_RESTRICTED_ROLES.includes(role),
    ),
    canAccessTemplates: userInfo.is_admin === true,
  };
};
