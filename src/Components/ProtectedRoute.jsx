import { Navigate } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";

const ProtectedRoute = ({ children }) => {
  const userInfo = useUserInfo();

  // If there's no user , redirect to login
  if (!userInfo || !userInfo.id) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
