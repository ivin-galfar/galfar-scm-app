/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alerts from "./Alerts";

const LogoutButton = ({ children, className, title, onLogoutRequested }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const requestLogout = () => {
    onLogoutRequested?.();
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("userInfo");
    setShowConfirm(false);
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
