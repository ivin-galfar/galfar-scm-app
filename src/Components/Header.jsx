import { Link, NavLink, useLocation } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import galfarlogo from "../assets/Images/logo-new.png";
import SideNav from "./SideNav";
import { useContext, useEffect, useRef, useState } from "react";
import UserDropdown from "./UserDropdown";
import { AppContext } from "./Context";
import { is_logistics, is_plant } from "../Helpers/dept_helper";
import { useDashboardType } from "../store/logisticsStore";

const Header = () => {
  const userInfo = useUserInfo();
  const { setStatusFilter, setMultiStatusFilter } = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef(null);
  const isLogistics = is_logistics(userInfo?.dept_code);
  const isPlant = is_plant(userInfo?.dept_code);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (canvasRef.current && !canvasRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const navLinkClasses = ({ isActive }) => {
    return `text-gray-700 hover:text-blue-600 ${isActive ? "border-b-2 border-blue-500 text-blue-600" : ""}`;
  };
  const { dashboardType, setDashboardType } = useDashboardType();

  const location = useLocation();
  const path = location.pathname;
  return (
    <div>
      <header className="bg-white shadow-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex  items-center h-16">
            <div className="flex space-x-6">
              <div className="flex justify-center items-center p-6">
                <NavLink to="/">
                  <img
                    src={galfarlogo}
                    alt="Galfar Logo"
                    className="h-10 w-auto"
                  />
                </NavLink>
              </div>
            </div>
            <div className="ml-auto mr-45">
              <nav className="flex space-x-8 ">
                <NavLink to="/" className={navLinkClasses}>
                  Home
                </NavLink>
                <NavLink
                  to={isPlant ? "/dashboard" : "/dashboardlg"}
                  className={() => {
                    const isActive =
                      path.startsWith("/dashboard") ||
                      path.startsWith("/dashboardlg");

                    return `text-gray-700 hover:text-blue-600 ${
                      isActive ? "border-b-2 border-blue-500 text-blue-600" : ""
                    }`;
                  }}
                  onClick={() => {
                    setStatusFilter("All");
                    setMultiStatusFilter([]);
                    if (isPlant) {
                      setDashboardType("plant");
                    } else {
                      setDashboardType("logistics");
                    }
                  }}
                >
                  Dashboard
                </NavLink>
                {(isPlant || isLogistics) && (
                  <NavLink
                    to={isPlant ? "/receipts" : "/lstatements"}
                    className={() => {
                      const isActive =
                        path.startsWith("/receipts") ||
                        path.startsWith("/lstatements");

                      return `text-gray-700 hover:text-blue-600 ${
                        isActive
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : ""
                      }`;
                    }}
                  >
                    Statements
                  </NavLink>
                )}

                <NavLink to="/contact" className={navLinkClasses}>
                  Contact
                </NavLink>
                {userInfo?.email && <UserDropdown />}
              </nav>
            </div>
          </div>{" "}
        </div>
      </header>

      <SideNav
        isOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        ref={canvasRef}
      />
    </div>
  );
};

export default Header;
