/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import { getModuleNavigationAccess } from "../Helpers/navigationPermissions";

const NavigationPermissionRoute = ({ children, permission }) => {
  const userInfo = useUserInfo();

  if (!userInfo?.token) {
    return <Navigate to="/login" replace />;
  }

  const requiredPermissions = Array.isArray(permission)
    ? permission
    : [permission];
  const navigationAccess = getModuleNavigationAccess(userInfo);

  if (!requiredPermissions.every((key) => navigationAccess[key])) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default NavigationPermissionRoute;
