/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import { getFleetRequestAccess } from "../Helpers/fleetRequestPermissions";

const FleetRequestRoute = ({ children }) => {
  const userInfo = useUserInfo();

  if (!userInfo?.token) return <Navigate to="/login" replace />;
  if (!getFleetRequestAccess(userInfo).canAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default FleetRequestRoute;
