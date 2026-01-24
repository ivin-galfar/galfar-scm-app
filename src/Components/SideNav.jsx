import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import { FaLock, FaHome } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { HiDocumentText } from "react-icons/hi2";
import { FaSignOutAlt } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { AppContext } from "./Context";
import { FiMenu } from "react-icons/fi";
import { AiFillCaretUp } from "react-icons/ai";
import { AiFillCaretDown } from "react-icons/ai";
import { FaSignInAlt } from "react-icons/fa";
import { FaTruck } from "react-icons/fa";
import { is_logistics, is_plant } from "../Helpers/dept_helper";
import { GiCrane } from "react-icons/gi";
import { useDashboardType } from "../store/logisticsStore";
import { IoHelpCircleSharp } from "react-icons/io5";

const SideNav = ({ isOpen, setIsMenuOpen, ref }) => {
  const { setStatusFilter, setMultiStatusFilter } = useContext(AppContext);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [submenu1Open, setSubmenu1Open] = useState(false);
  const { setDashboardType } = useDashboardType();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };
  const userInfo = useUserInfo();
  const isLogistics = is_logistics(userInfo?.dept_code);
  const isPlant = is_plant(userInfo?.dept_code);

  return (
    <div
      ref={ref}
      onMouseLeave={() => setIsMenuOpen(false)}
      className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 shadow transition-all duration-300 
    ${isOpen ? "w-68" : "w-15"}`}
    >
      <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
        <button
          className="flex items-center gap-2 text-gray-700 cursor-pointer"
          onClick={() => setIsMenuOpen(true)}
        >
          <FiMenu className="h-6 w-6" />
          {isOpen && (
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
              Menu
            </h2>
          )}
        </button>

        {isOpen && (
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      <nav className={`p-4  ${!isOpen ? "space-y-7" : "space-y-4"}`}>
        <Link
          to="/"
          className={`flex items-center gap-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700
      h-10 px-2
      ${!isOpen ? "justify-center w-10" : "justify-start w-full"}
    `}
        >
          <FaHome className="text-lg" />
          {isOpen && <span className="whitespace-nowrap">Home</span>}
        </Link>
        <button
          onClick={() => setSubmenuOpen(!submenuOpen)}
          className="flex min-h-10 p-2  items-center gap-2  rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
        >
          <GiCrane className="text-xl" />
          {isOpen && (
            <span className="flex flex-1 items-center gap-2">
              <span className=" break-words">Plant - CS </span>
              <span className="ml-auto flex gap-2 text-gray-500 dark:text-gray-300 cursor-pointer">
                {submenuOpen ? <AiFillCaretUp /> : <AiFillCaretDown />}
                {!isPlant ? <FaLock /> : ""}
              </span>
            </span>
          )}
        </button>
        {isOpen && submenuOpen && (
          <div className="ml-6 mt-2 space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700  ${
                !isPlant
                  ? "pointer-events-none opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                setStatusFilter("All");
                setMultiStatusFilter([]);
                setDashboardType("plant");
              }}
            >
              <MdSpaceDashboard />
              {isOpen && <span>Dashboard</span>}
            </Link>

            <Link
              to="/particulars/1"
              className={`flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                !userInfo?.is_admin || !isPlant
                  ? "pointer-events-none opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <HiDocumentText />
              {isOpen && (
                <>Particulars {!userInfo?.is_admin ? <FaLock /> : ""}</>
              )}
            </Link>

            <Link
              to="/receipts"
              className={`flex gap-2 p-2 items-center rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                !isPlant
                  ? "pointer-events-none opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <IoDocumentText />
              {isOpen && <span>Comparative Statements</span>}
            </Link>
          </div>
        )}
        <hr className="border-0 h-px bg-gray-200 my-1 mx-2" />
        <button
          onClick={() => setSubmenu1Open(!submenu1Open)}
          className="flex min-h-10 p-2  items-center gap-2  rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
        >
          <FaTruck />

          {isOpen && (
            <span className="flex flex-1 items-center gap-2 w-1xs">
              <span className=" break-words">Logistics - CS</span>
              <span className="ml-auto flex gap-2 text-gray-500 dark:text-gray-300 cursor-pointer">
                {submenu1Open ? <AiFillCaretUp /> : <AiFillCaretDown />}
                {!isLogistics ? <FaLock /> : ""}
              </span>
            </span>
          )}
        </button>
        {isOpen && submenu1Open && (
          <div className="ml-6 mt-2 space-y-2">
            <Link
              to="/dashboardlg"
              className={`flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                !isLogistics
                  ? "pointer-events-none opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                setDashboardType("logistics");
              }}
            >
              <MdSpaceDashboard />
              {isOpen && <span>Dashboard</span>}
            </Link>

            <Link
              to="/particulars/2"
              className={`flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                !userInfo?.is_admin
                  ? "pointer-events-none opacity-50 cursor-not-allowed"
                  : ""
              }${
                !isLogistics
                  ? "pointer-events-none opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <HiDocumentText />
              {isOpen && (
                <>Particulars {!userInfo?.is_admin ? <FaLock /> : ""}</>
              )}
            </Link>

            <Link
              to="/lstatements"
              className={`flex gap-2 p-2 items-center rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                !isLogistics
                  ? "pointer-events-none opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <IoDocumentText />
              {isOpen && <span>Comparative Statements</span>}
            </Link>
          </div>
        )}
        <hr className="border-0 h-px bg-gray-200 my-1 mx-2" />
        <button>
          <Link
            to="https://www.notion.so/Galfar-Intranet-2a592f8cf63380d5b90ff24cad08c79e"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700`}
          >
            <IoHelpCircleSharp className="text-lg" />
            {isOpen && (
              <span className="whitespace-nowrap">Help & Resources</span>
            )}
          </Link>
        </button>

        <button
          className="flex gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
          onClick={handleLogout}
        >
          {userInfo ? (
            <FaSignOutAlt />
          ) : (
            <FaSignInAlt className="text-green-400 text-2xl glow-pop-green" />
          )}
          {isOpen && (userInfo ? "Sign out" : "Sign In")}
        </button>
      </nav>
    </div>
  );
};

export default SideNav;
