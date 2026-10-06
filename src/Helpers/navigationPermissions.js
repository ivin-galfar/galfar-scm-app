import { getInitiatorCapabilities } from "./initiatorCapabilities.js";

const COMMON_MODULE_ROLES = ["pm", "pd", "hod", "cm", "fm", "gm", "ceo"];
const HIRING_ASSET_RESTRICTED_ROLES = ["pm", "cm", "pd", "fm"];
const BUY_VS_RENT_RESTRICTED_ROLES = ["pm", "cm", "pd"];
const GENERAL_FN_IOC_RESTRICTED_ROLES = ["cm", "pm", "pd"];
const LOGISTICS_RESTRICTED_ROLES = ["cm"];
const PLANT_RESTRICTED_ROLES = ["initpr", "initdc", "pm", "pd", "cm"];
const PLANT_INITIATOR_ROLES = ["inith", "inita"];
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
  const hasGeneralFnIocRestriction = roles.some((role) =>
    GENERAL_FN_IOC_RESTRICTED_ROLES.includes(role),
  );
  const isStandaloneFnInitiator = roles.every((role) => role === "initfn");
  const hasPlantInitiatorRole = roles.some((role) =>
    PLANT_INITIATOR_ROLES.includes(role),
  );
  const isFleetRequestOnlyUser =
    roles.includes("initfr") && !hasPlantInitiatorRole && !isCommonUser;
  const initiatorCapabilities = getInitiatorCapabilities(roles);

  return {
    canAccessPlant:
      !roles.some((role) => PLANT_RESTRICTED_ROLES.includes(role)) &&
      !isFleetRequestOnlyUser &&
      (isCommonUser || departmentCodes.includes("1")),
    canAccessLogistics:
      !roles.some((role) => LOGISTICS_RESTRICTED_ROLES.includes(role)) &&
      (isCommonUser || departmentCodes.includes("2")),
    canAccessProjects:
      !isStandaloneFnInitiator &&
      !roles.some((role) => PROJECTS_RESTRICTED_ROLES.includes(role)),
    canViewProjectsNavigation: true,
    canAccessFNIOC:
      initiatorCapabilities.canAccessFNIOC ||
      ((!hasGeneralFnIocRestriction ||
        roles.some((role) =>
          ["hod", "fm", "gm", "ceo", "inith", "inita"].includes(role),
        )) &&
        (isCommonUser || departmentCodes.includes("1"))),
    canAccessHiringAsset:
      !isStandaloneFnInitiator &&
      !roles.some((role) => HIRING_ASSET_RESTRICTED_ROLES.includes(role)),
    canAccessBuyVsRent:
      !isStandaloneFnInitiator &&
      !roles.some((role) => BUY_VS_RENT_RESTRICTED_ROLES.includes(role)),
    canAccessTemplates: userInfo.is_admin === true,
  };
};
