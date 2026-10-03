import { NavLink, useLocation } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import galfarlogo from "../assets/Images/galfar-logo-clean.png";
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
  is_dc,
  is_hire,
} from "../Helpers/dept_helper";
import { useDashboardType, useStatusFilter } from "../store/logisticsStore";
import { usePagination } from "../store/statementStore";
import { getDeptConfig } from "../Helpers/Permissions";
import { useQuickAccess } from "../store/helperStore";
import { getFleetRequestAccess } from "../Helpers/fleetRequestPermissions";

const Header = () => {
  const userInfo = useUserInfo();
  const { setStatusFilter, setMultiStatusFilter } = useContext(AppContext);
  const { setStatusFilter: setStatusFilterzustand } = useStatusFilter();
  const { selectedDept, setSelectedDept } = useSelectedDept();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef(null);
  const isLogistics = is_logistics(userInfo?.dept_code);
  const isPlant = is_plant(userInfo?.dept_code);
  const isfm = is_fm(userInfo?.role);
  const isasset = is_asset(userInfo?.role);
  const ishire = is_hire(userInfo?.role);
  const isdc = is_dc(userInfo?.role);

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
  const { setDashboardType } = useDashboardType();
  const { setPageSize } = usePagination();
  const { resetIsClicked } = useQuickAccess();

  const location = useLocation();
  const path = location.pathname;
  const { canAccess: canAccessFleetRequests } = getFleetRequestAccess(userInfo);
  const { defaultDept } = getDeptConfig({
    isLogistics,
    isPlant,
    isfm,
    isasset,
    ishod,
    isceo,
    isgm,
    isdc,
    ishire,
  });

  const effectiveDept = defaultDept || selectedDept;
  const dashboardLink =
    effectiveDept === "hiring" || effectiveDept === "asset"
      ? "/dashboard"
      : effectiveDept === "logistics"
        ? "/dashboardlg"
        : effectiveDept === "fn"
          ? "/dashboardfn"
          : effectiveDept === "bvrplant"
            ? "/dashboardbr"
            : "/dashboard";

  useEffect(() => {
    if (!userInfo) return;
    setSelectedDept(defaultDept);
    setDashboardType(defaultDept);
  }, [userInfo, isLogistics, isfm, isPlant, isasset, defaultDept]);
  const isDisabled =
    (userInfo?.is_admin &&
      !userInfo?.role?.includes("inith") &&
      !userInfo?.role?.includes("inita") &&
      !userInfo?.role?.includes("initlg")) ||
    userInfo?.role?.includes("cm") ||
    userInfo?.role?.includes("view");
  return (
    <div>
      <header className="app-header bg-white shadow-md">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center justify-center px-3 py-2">
                <NavLink
                  to="/"
                  className="block overflow-hidden rounded-lg bg-white p-1 shadow-sm"
                  aria-label="Galfar home"
                >
                  <img
                    src={galfarlogo}
                    alt="Galfar"
                    className="h-10 w-10 object-contain"
                  />
                </NavLink>
              </div>
              <div className="hidden h-9 items-center border-l border-white/25 pl-4 md:flex">
                <div className="flex flex-col justify-center leading-tight">
                  <span className="block text-[15px] font-semibold uppercase tracking-[0.22em] text-white">
                    Galfar
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                    Integrated Web Application
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-auto min-w-0">
              <nav className="flex items-center gap-4 lg:gap-7">
                <NavLink to="/" className={navLinkClasses}>
                  Home
                </NavLink>
                <NavLink
                  to={dashboardLink}
                  className={() => {
                    const isActive =
                      path === "/dashboard" ||
                      path === "/dashboardbr" ||
                      path.startsWith("/receipts") ||
                      path === "/dashboardlg" ||
                      path.startsWith("/lstatements") ||
                      path.startsWith("/brstatement");

                    return `text-gray-700 hover:text-blue-600 ${
                      isActive ? "border-b-2 border-blue-500 text-blue-600" : ""
                    }${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`;
                  }}
                  onClick={() => {
                    resetIsClicked();
                    setStatusFilter("All");
                    setStatusFilterzustand("All");
                    setMultiStatusFilter([]);
                    setDashboardType(effectiveDept);
                    setPageSize(20);
                  }}
                >
                  Comparative Statements
                </NavLink>
                {canAccessFleetRequests && (
                  <NavLink
                    to="/dashboardfr"
                    className={() => {
                      const isActive =
                        location.pathname.startsWith("/dashboardfr") ||
                        location.pathname.startsWith("/fleetrequest");

                      return `text-gray-700 hover:text-blue-600 ${
                        isActive
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : ""
                      }`;
                    }}
                  >
                    Fleet Req.
                  </NavLink>
                )}
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
