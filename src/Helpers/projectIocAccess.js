const PROJECT_IOC_ROLES = ["initpr", "initdc", "cm", "pm", "pd", "view"];
const BROAD_FN_IOC_ROLES = ["gm", "ceo", "fm", "hod", "inith", "inita"];
const PROJECT_IOC_CATEGORIES = ["Demob", "FWA"];

const normalizeRoles = (roles = []) =>
  (Array.isArray(roles) ? roles : [roles])
    .filter(Boolean)
    .map((role) => role.toLowerCase());

export const getProjectIocAccess = (userInfo) => {
  const roles = normalizeRoles(userInfo?.role);
  const hasProjectRole = PROJECT_IOC_ROLES.some((role) => roles.includes(role));
  const hasBroadRole = BROAD_FN_IOC_ROLES.some((role) => roles.includes(role));
  const isProjectScoped = hasProjectRole && !hasBroadRole;

  let allowedCategories = null;
  if (isProjectScoped) {
    allowedCategories = [];

    if (
      roles.some((role) =>
        ["initpr", "inith", "cm", "pm", "pd", "view"].includes(role),
      )
    ) {
      allowedCategories.push("Demob");
    }
    if (roles.some((role) => ["initdc", "cm", "pm", "pd"].includes(role))) {
      allowedCategories.push("FWA");
    }
  }

  return {
    canAccess:
      hasProjectRole ||
      hasBroadRole ||
      roles.includes("initfn") ||
      Boolean(userInfo?.is_admin),
    isProjectScoped,
    allowedCategories,
    defaultCategory: allowedCategories?.includes("Demob") ? "Demob" : "FWA",
  };
};

export const getProjectIocCategoryOptions = (
  categories = [],
  allowedCategories = null,
) => {
  const permittedCategories = allowedCategories ?? PROJECT_IOC_CATEGORIES;
  return categories.filter((category) => permittedCategories.includes(category));
};
