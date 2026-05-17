import { useState, useEffect, useRef } from "react";
import { FaRegUser, FaChevronDown } from "react-icons/fa";
import useUserInfo from "../CustomHooks/useUserInfo";
import { Link, useNavigate } from "react-router-dom";
import Alerts from "./Alerts";
import { FiExternalLink } from "react-icons/fi";
import { updatedocread } from "../APIs/api";
import { useMutation } from "@tanstack/react-query";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFavourites, setShowFavourites] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const userInfo = useUserInfo();

  const userEmail = userInfo?.email;
  const isAdmin = userInfo?.is_admin;

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    setShowConfirm(true);
  };
  const handleConfirmLogout = () => {
    localStorage.removeItem("userInfo");
    setShowConfirm(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowFavourites(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { mutate: updateDocReadMutation } = useMutation({
    mutationFn: updatedocread,
    onSuccess: (data) => {
      console.log("User clicked:", data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleUpdateDocRead = () => {
    updateDocReadMutation(userInfo);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-tr from-blue-200 to-blue-100 text-blue-700  transition border border-blue-300 cursor-pointer"
      >
        <FaRegUser size={15} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-fade-in overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 rounded-t-xl">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {userEmail}
            </p>
          </div>
          <span>
            <button
              className="w-full flex text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 transition cursor-pointer"
              onClick={handleUpdateDocRead}
            >
              <Link
                to="https://www.notion.so/Galfar-Intranet-2a592f8cf63380d5b90ff24cad08c79e"
                className="flex  items-center gap-2"
                target="_blank"
              >
                {" "}
                Galfar Wiki <FiExternalLink />
              </Link>
            </button>
          </span>
          <div className="border-t border-gray-100" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}

      {showConfirm && (
        <Alerts
          message="Are you sure you want to log out?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmLogout}
        />
      )}
    </div>
  );
};

export default UserDropdown;
