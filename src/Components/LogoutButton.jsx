/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../APIs/api";
import Alerts from "./Alerts";

const LogoutButton = ({ children, className, title, onLogoutRequested }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const requestLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Failed to clear the authentication cookie during logout.", error);
    }

    localStorage.removeItem("userInfo");
    setShowConfirm(false);
    onLogoutRequested?.();
    navigate("/login");
  };

  return (
    <>
      <button
        type="button"
        className={className}
        title={title}
        onClick={requestLogout}
      >
        {children}
      </button>

      {showConfirm && (
        <Alerts
          message="Are you sure you want to log out?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmLogout}
        />
      )}
    </>
  );
};

export default LogoutButton;
