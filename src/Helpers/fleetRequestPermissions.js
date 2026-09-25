export const getFleetRequestAccess = (user) => {
  const permission = user?.permission;
  const level =
    permission?.statement_role?.trim().toLowerCase() === "fl_req"
      ? permission?.access_level?.trim().toLowerCase()
      : undefined;

  const canManage = level === "manage";
  const canEdit = canManage || level === "edit";
  const canApprove = canManage || level === "view";

  return {
    canAccess: canEdit || canApprove || canManage,
    canEdit,
    canApprove,
    canManage,
  };
};
