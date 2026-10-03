import { categoryapprovers } from "./roles_helper.js";

const managementRoles = new Set([
  ...Object.values(categoryapprovers).flat(),
  "INCHARGE",
]);

export const getDashboardTimePeriod = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
};

export const isManagementUser = (userInfo) => {
  const roles = Array.isArray(userInfo?.role)
    ? userInfo.role
    : [userInfo?.role];

  return roles.some((role) =>
    managementRoles.has(
      String(role ?? "")
        .trim()
        .toUpperCase(),
    ),
  );
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getSafeUserIdentifier = (userInfo) => {
  const identifier =
    userInfo?.id ?? userInfo?.user_id ?? userInfo?.email?.split("@")[0];

  return String(identifier ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");
};

export const getMilestoneStorageKey = (userInfo, date = new Date()) => {
  const identifier = getSafeUserIdentifier(userInfo);

  if (!identifier) return null;

  return `milestone_${identifier}_${formatLocalDate(date)}_${getDashboardTimePeriod(date)}`;
};
