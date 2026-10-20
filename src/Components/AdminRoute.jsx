/* eslint-disable react/prop-types */
import { Navigate, useParams } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import { getModuleNavigationAccess } from "../Helpers/navigationPermissions";

const AdminRoute = ({ children }) => {
  const userInfo = useUserInfo();
  const { dept_id: departmentId } = useParams();

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const navigationAccess = getModuleNavigationAccess(userInfo);
  const canAccessDepartment =
    (departmentId === "1" && navigationAccess.canAccessPlant) ||
    (departmentId === "2" && navigationAccess.canAccessLogistics);

  if (!navigationAccess.canAccessTemplates || !canAccessDepartment) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;