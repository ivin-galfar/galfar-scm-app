/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { logoutUser } from "../APIs/api";
import Alerts from "./Alerts";

const LogoutButton = ({ children, className, title, onLogoutRequested }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!logoutError) return undefined;

    const timer = setTimeout(() => setLogoutError(""), 4000);
    return () => clearTimeout(timer);
  }, [logoutError]);

  const requestLogout = () => {
    setLogoutError("");
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await logoutUser();
    } catch {
      setLogoutError(
        "Couldn’t confirm logout. Please try again.",
      );
      setShowConfirm(false);
      return;
    }

    localStorage.removeItem("userInfo");
    setLogoutError("");
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

      {logoutError &&
        createPortal(
          <div
            className="fixed left-1/2 top-5 z-[200] -translate-x-1/2 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white shadow-xl"
            role="alert"
            aria-live="assertive"
          >
            {logoutError}
          </div>,
          document.body,
        )}

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
