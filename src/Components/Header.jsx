import { Link, NavLink, useLocation } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import galfarlogo from "../assets/Images/logo-new.png";
import SideNav from "./SideNav";
import { useContext, useEffect, useRef, useState } from "react";
import UserDropdown from "./UserDropdown";
import { useSelectedDept } from "../store/userStore";
import { AppContext } from "./Context";
import {
  is_logistics,
  is_plant,
  is_fm,
  is_asset,
  is_hod,
  is_gm,
  is_ceo,
} from "../Helpers/dept_helper";
import { useDashboardType, useStatusFilter } from "../store/logisticsStore";
import { usePagination } from "../store/statementStore";
import { getDeptConfig } from "../Helpers/Permissions";

const Header = () => {
  const userInfo = useUserInfo();
  const { statusFilter, setStatusFilter, setMultiStatusFilter } =
    useContext(AppContext);
  const { setStatusFilter: setStatusFilterzustand } = useStatusFilter();
  const { selectedDept, setSelectedDept } = useSelectedDept();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef(null);
  const isLogistics = is_logistics(userInfo?.dept_code);
  const isPlant = is_plant(userInfo?.dept_code);
  const isfm = is_fm(userInfo?.role);
  const isasset = is_asset(userInfo?.role);
  const ishod = is_hod(userInfo?.role);
  const isgm = is_gm(userInfo?.role);
  const isceo = is_ceo(userInfo?.role);
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
  const { setPageSize } = usePagination();

  const location = useLocation();
  const path = location.pathname;
  const { defaultDept } = getDeptConfig({
    isLogistics,
    isPlant,
    isfm,
    isasset,
    ishod,
    isceo,
    isgm,
  });

  useEffect(() => {
    if (!userInfo) return;
    setSelectedDept(defaultDept);
    setDashboardType(defaultDept);
  }, [userInfo, isLogistics, isfm, isPlant, isasset]);

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
                  to={
                    selectedDept == "plant"
                      ? "/dashboard"
                      : selectedDept == "logistics"
                        ? "/dashboardlg"
                        : "/dashboardbr"
                  }
                  className={() => {
                    const isActive =
                      path === "/dashboard" ||
                      path === "/dashboardbr" ||
                      path.startsWith("/receipts") ||
                      path === "/dashboardlg" ||
                      path.startsWith("/lstatements") ||
                      path === "/dashboardbr" ||
                      path == "/brstatement";

                    return `text-gray-700 hover:text-blue-600 ${
                      isActive ? "border-b-2 border-blue-500 text-blue-600" : ""
                    }`;
                  }}
                  onClick={() => {
                    setStatusFilter("All");
                    setStatusFilterzustand("All");
                    setMultiStatusFilter([]);
                    setDashboardType(selectedDept);
                    setPageSize(20);
                  }}
                >
                  Comp. Statements
                </NavLink>

                <NavLink
                  to="/dashboardfn"
                  className={() => {
                    const isActive =
                      location.pathname.startsWith("/dashboardfn") ||
                      location.pathname.startsWith("/filenote");

                    return `text-gray-700 hover:text-blue-600 ${
                      isActive ? "border-b-2 border-blue-500 text-blue-600" : ""
                    }`;
                  }}
                >
                  FN/IOC
                </NavLink>

                {/* <NavLink to="/filenote" className={navLinkClasses}>
                  Documents
                </NavLink> */}
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
