/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBalanceScale,
  FaChartBar,
  FaClipboardList,
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserTie,
  FaProjectDiagram,
  FaLock,
} from "react-icons/fa";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { HiDocumentText } from "react-icons/hi2";
import { IoDocumentText, IoHelpCircleSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import useUserInfo from "../CustomHooks/useUserInfo";
import { is_plant } from "../Helpers/dept_helper";
import { useDashboardType } from "../store/logisticsStore";
import { updatedocread } from "../APIs/api";
import galfarlogo from "../assets/Images/galfar-logo-clean.png";
import LogoutButton from "./LogoutButton";
import { PiBulldozer } from "react-icons/pi";
import { getModuleNavigationAccess } from "../Helpers/navigationPermissions";
import { FaShip } from "react-icons/fa6";

const SideNav = ({ isOpen, setIsMenuOpen, ref }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [submenu1Open, setSubmenu1Open] = useState(false);
  const [projectsSubmenuOpen, setProjectsSubmenuOpen] = useState(false);
  const { setDashboardType } = useDashboardType();
  const { pathname, search } = useLocation();

  const userInfo = useUserInfo();
  const isPlant = is_plant(userInfo?.dept_code);
  const {
    canAccessPlant,
    canAccessLogistics,
    canAccessProjects,
    canViewProjectsNavigation,
    canAccessHiringAsset,
    canAccessBuyVsRent,
    canAccessTemplates,
  } = getModuleNavigationAccess(userInfo);
  const canOpenHiringAsset = canAccessPlant && canAccessHiringAsset;
  const canOpenBuyVsRent = canAccessPlant && canAccessBuyVsRent;
  const canOpenPlantTemplates = canAccessPlant && canAccessTemplates;
  const canOpenLogisticsTemplates = canAccessLogistics && canAccessTemplates;
  const isProjectIocRoute =
    pathname === "/dashboardfn" &&
    new URLSearchParams(search).get("view") === "projects-ioc";

  useEffect(() => {
    if (isPlant) {
      setDashboardType("plant");
    } else {
      setDashboardType("bvrplant");
    }
    // Keep nav open if user is not logged in
    if (!userInfo) {
      setIsMenuOpen(true);
    }
  }, [userInfo, setIsMenuOpen, isPlant]);
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

  const isFnRoute =
    (pathname === "/dashboardfn" && !isProjectIocRoute) ||
    pathname.startsWith("/filenote");
  const isPlantRoute =
    pathname === "/dashboard" ||
    pathname === "/dashboardbr" ||
    pathname.startsWith("/particulars/1") ||
    pathname.startsWith("/receipts") ||
    pathname.startsWith("/brstatement") ||
    isFnRoute;
  const isProjectsRoute =
    pathname.startsWith("/fleetrequest") ||
    pathname.startsWith("/dashboardfr") ||
    isProjectIocRoute;
  const isLogisticsRoute =
    pathname === "/dashboardlg" ||
    pathname.startsWith("/particulars/2") ||
    pathname.startsWith("/lstatements");

  useEffect(() => {
    if (!isOpen) return;

    if (isPlantRoute) {
      setSubmenuOpen(true);
    } else if (isProjectsRoute) {
      setProjectsSubmenuOpen(true);
    } else if (isLogisticsRoute) {
      setSubmenu1Open(true);
    }
  }, [isOpen, isLogisticsRoute, isPlantRoute, isProjectsRoute]);

  const toggleSection = (section) => {
    if (!isOpen) {
      setIsMenuOpen(true);
      if (section === "plant") setSubmenuOpen(true);
      if (section === "projects") setProjectsSubmenuOpen(true);
      if (section === "logistics") setSubmenu1Open(true);
      return;
    }

    if (section === "plant") setSubmenuOpen((current) => !current);
    if (section === "projects") {
      setProjectsSubmenuOpen((current) => !current);
    }
    if (section === "logistics") setSubmenu1Open((current) => !current);
  };

  const itemClass = (isActive = false, isDisabled = false) =>
    `group relative flex h-10 min-h-10 w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 ${
      isOpen ? "px-3" : "justify-center px-0"
    } ${isDisabled ? "cursor-not-allowed text-slate-400/60" : ""} ${
      isActive
        ? "bg-sky-400/18 text-white before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r-full before:bg-sky-300"
        : isDisabled
          ? ""
          : "text-slate-200/90 hover:bg-white/8 hover:text-white"
    }`;

  const disabledLinkProps = (isDisabled) =>
    isDisabled
      ? {
          "aria-disabled": true,
          "aria-describedby": "disabled-navigation-description",
          tabIndex: 0,
          title: "Unavailable for your current role",
          onClick: (event) => event.preventDefault(),
        }
      : {};

  const iconClass = (isActive = false) =>
    `h-5 w-5 shrink-0 transition-colors duration-200 ${
      isActive ? "text-sky-200" : "text-slate-300 group-hover:text-white"
    }`;

  const userLabel = userInfo?.email?.split("@")[0] || "Signed-in user";
  const firstRole = userInfo?.role?.[0];
  const primaryRole = firstRole?.toLowerCase().startsWith("init")
    ? "Initiator"
    : firstRole;

  return (
    <aside
      ref={ref}
      className={`app-sidenav fixed left-0 top-0 z-50 flex h-dvh flex-col overflow-hidden shadow transition-[width] duration-300 ease-out ${
        isOpen ? "w-68" : "w-15"
      }`}
      aria-label="Primary navigation"
    >
      <div
        className={`flex h-16 shrink-0 items-center border-b border-white/10 ${
          isOpen ? "justify-between px-4" : "justify-center px-2"
        }`}
      >
        {isOpen ? (
          <Link
            to="/"
            className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70"
            aria-label="Galfar home"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
              <img
                src={galfarlogo}
                alt=""
                className="h-full w-full object-contain"
              />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-xs font-bold tracking-[0.12em] text-white">
                GALFAR
              </span>
              <span className="mt-2 flex whitespace-nowrap text-[10px] font-bold tracking-[0.12em] text-white">
                Integrated Web Application
              </span>
            </span>
          </Link>
        ) : (
          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-100 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            onClick={() => setIsMenuOpen(true)}
            title="Open menu"
            aria-label="Open navigation menu"
          >
            <FiMenu className="h-5 w-5 shrink-0" />
          </button>
        )}

        {isOpen && (
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label="Collapse navigation menu"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav
        className={`min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden py-3 [scrollbar-color:rgba(186,230,253,0.25)_transparent] [scrollbar-width:thin] ${
          isOpen ? "px-3" : "px-2.5"
        }`}
      >
        <span id="disabled-navigation-description" className="sr-only">
          This navigation item is unavailable for your current role.
        </span>
        {isOpen && (
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/55">
            Workspace
          </p>
        )}
        <Link
          to="/"
          className={itemClass(pathname === "/")}
          title={!isOpen ? "Home" : undefined}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <FaHome className={iconClass(pathname === "/")} />
          {isOpen && <span className="truncate">Home</span>}
        </Link>

        {isOpen && (
          <p className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/55">
            Operations
          </p>
        )}

        <button
          type="button"
          onClick={() => toggleSection("plant")}
          className={itemClass(isPlantRoute && canAccessPlant, !canAccessPlant)}
          title={
            !isOpen
              ? `Plant & Equipment${canAccessPlant ? "" : " (Locked)"}`
              : undefined
          }
          aria-expanded={submenuOpen}
          aria-controls="plant-navigation"
        >
          <PiBulldozer className={iconClass(isPlantRoute)} />
          {!isOpen && !canAccessPlant && (
            <FaLock
              className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5"
              aria-label="Locked"
            />
          )}
          {isOpen && (
            <>
              <span className="min-w-0 flex-1 truncate text-left">
                Plant & Equipment
              </span>
              {!canAccessPlant && (
                <FaLock className="h-3.5 w-3.5 shrink-0" aria-label="Locked" />
              )}
              <FiChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                  submenuOpen ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        {isOpen && submenuOpen && (
          <div
            id="plant-navigation"
            className="relative ml-5 mt-1 shrink-0 space-y-1 border-l border-sky-200/15 pl-3 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <Link
              to="/dashboard"
              className={itemClass(
                pathname === "/dashboard" && canOpenHiringAsset,
                !canOpenHiringAsset,
              )}
              onClick={
                canOpenHiringAsset ? () => setDashboardType("plant") : undefined
              }
              {...disabledLinkProps(!canOpenHiringAsset)}
            >
              <FaChartBar className={iconClass(pathname === "/dashboard")} />
              <span className="min-w-0 flex-1 truncate">Hiring / Asset</span>
            </Link>
            <Link
              to="/dashboardbr"
              className={itemClass(
                pathname === "/dashboardbr" && canOpenBuyVsRent,
                !canOpenBuyVsRent,
              )}
              onClick={
                canOpenBuyVsRent
                  ? () => setDashboardType("bvrplant")
                  : undefined
              }
              {...disabledLinkProps(!canOpenBuyVsRent)}
            >
              <FaBalanceScale
                className={iconClass(pathname === "/dashboardbr")}
              />
              <span className="min-w-0 flex-1 truncate">Buy vs Rent</span>
            </Link>
            <Link
              to="/dashboardfn"
              className={itemClass(
                isFnRoute && canAccessPlant,
                !canAccessPlant,
              )}
              {...disabledLinkProps(!canAccessPlant)}
              aria-current={isFnRoute && canAccessPlant ? "page" : undefined}
            >
              <IoDocumentText className={iconClass(isFnRoute)} />
              <span className="min-w-0 flex-1 truncate">FN / IOC</span>
            </Link>
            <Link
              to="/particulars/1"
              className={itemClass(
                pathname.startsWith("/particulars/1") && canOpenPlantTemplates,
                !canOpenPlantTemplates,
              )}
              {...disabledLinkProps(!canOpenPlantTemplates)}
            >
              <HiDocumentText
                className={iconClass(pathname.startsWith("/particulars/1"))}
              />
              <span className="min-w-0 flex-1 truncate">Templates</span>
            </Link>
          </div>
        )}

        {canViewProjectsNavigation && (
          <button
            type="button"
            onClick={() => toggleSection("projects")}
            className={`${itemClass(
              isProjectsRoute && canAccessProjects,
              !canAccessProjects,
            )} mt-1`}
            title={
              !isOpen
                ? `Projects${canAccessProjects ? "" : " (Locked)"}`
                : undefined
            }
            aria-expanded={projectsSubmenuOpen}
            aria-controls="projects-navigation"
          >
            <FaProjectDiagram className={iconClass(isProjectsRoute)} />
            {!isOpen && !canAccessProjects && (
              <FaLock
                className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5"
                aria-label="Locked"
              />
            )}
            {isOpen && (
              <>
                <span className="min-w-0 flex-1 truncate text-left">
                  Projects
                </span>
                {!canAccessProjects && (
                  <FaLock
                    className="h-3.5 w-3.5 shrink-0"
                    aria-label="Locked"
                  />
                )}
                <FiChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                    projectsSubmenuOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>
        )}

        {canViewProjectsNavigation && isOpen && projectsSubmenuOpen && (
          <div
            id="projects-navigation"
            className="relative ml-5 mt-1 shrink-0 space-y-1 border-l border-sky-200/15 pl-3 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <Link
              to="/dashboardfr"
              className={itemClass(
                (pathname.startsWith("/dashboardfr") ||
                  pathname.startsWith("/fleetrequest")) &&
                  canAccessProjects,
                !canAccessProjects,
              )}
              {...disabledLinkProps(!canAccessProjects)}
            >
              <FaClipboardList
                className={iconClass(
                  pathname.startsWith("/dashboardfr") ||
                    pathname.startsWith("/fleetrequest"),
                )}
              />
              <span className="min-w-0 flex-1 truncate">Fleet Request</span>
            </Link>
            <Link
              to="/dashboardfn?view=projects-ioc"
              className={itemClass(
                isProjectIocRoute && canAccessProjects,
                !canAccessProjects,
              )}
              {...disabledLinkProps(!canAccessProjects)}
            >
              <IoDocumentText className={iconClass(isProjectIocRoute)} />
              <span className="min-w-0 flex-1 truncate">IOC</span>
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => toggleSection("logistics")}
          className={`${itemClass(
            isLogisticsRoute && canAccessLogistics,
            !canAccessLogistics,
          )} mt-1`}
          title={
            !isOpen
              ? `Logistics${canAccessLogistics ? "" : " (Locked)"}`
              : undefined
          }
          aria-expanded={submenu1Open}
          aria-controls="logistics-navigation"
        >
          <FaShip className={iconClass(isLogisticsRoute)} />
          {!isOpen && !canAccessLogistics && (
            <FaLock
              className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5"
              aria-label="Locked"
            />
          )}
          {isOpen && (
            <>
              <span className="min-w-0 flex-1 truncate text-left">
                Logistics
              </span>
              {!canAccessLogistics && (
                <FaLock className="h-3.5 w-3.5 shrink-0" aria-label="Locked" />
              )}
              <FiChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                  submenu1Open ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        {isOpen && submenu1Open && (
          <div
            id="logistics-navigation"
            className="relative ml-5 mt-1 shrink-0 space-y-1 border-l border-sky-200/15 pl-3 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <Link
              to="/particulars/2"
              className={itemClass(
                pathname.startsWith("/particulars/2") &&
                  canOpenLogisticsTemplates,
                !canOpenLogisticsTemplates,
              )}
              {...disabledLinkProps(!canOpenLogisticsTemplates)}
            >
              <HiDocumentText
                className={iconClass(pathname.startsWith("/particulars/2"))}
              />
              <span className="min-w-0 flex-1 truncate">Templates</span>
            </Link>
            <Link
              to="/dashboardlg"
              className={itemClass(
                pathname.startsWith("/lstatements") && canAccessLogistics,
                !canAccessLogistics,
              )}
              {...disabledLinkProps(!canAccessLogistics)}
            >
              <IoDocumentText
                className={iconClass(pathname.startsWith("/lstatements"))}
              />
              <span className="truncate">Comparative Statements</span>
            </Link>
          </div>
        )}

        {isOpen && (
          <p className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/55">
            Support
          </p>
        )}
        {!isOpen && <div className="my-3 h-px bg-white/10" />}

        <Link
          to="https://app.notion.com/p/Changelogs-2a792f8cf633815fabb5e328963521fa"
          target="_blank"
          rel="noopener noreferrer"
          className={itemClass(false)}
          onClick={handleUpdateDocRead}
          title={!isOpen ? "What's New" : undefined}
        >
          <IoHelpCircleSharp className={iconClass(false)} />
          {isOpen && (
            <span className="min-w-0 flex-1 truncate">What&apos;s New</span>
          )}
          {isOpen ? (
            <span className="ml-auto rounded-md border border-sky-200/20 bg-white/8 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] !text-sky-100">
              New
            </span>
          ) : (
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-sky-300 ring-2 ring-[#09528e]"
              aria-label="New updates available"
            />
          )}
        </Link>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-2.5">
        {userInfo && isOpen && (
          <div className="mb-2 flex min-w-0 items-center gap-3 rounded-lg bg-black/10 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-100 ring-1 ring-white/10">
              <FaUserTie className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold capitalize text-white">
                {userLabel}
              </p>
              {primaryRole && (
                <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-slate-300">
                  {primaryRole}
                </p>
              )}
            </div>
          </div>
        )}

        {userInfo ? (
          <LogoutButton
            className={itemClass(false)}
            title={!isOpen ? "Sign out" : undefined}
          >
            <FaSignOutAlt className={iconClass(false)} />
            {isOpen && <span className="truncate">Sign out</span>}
          </LogoutButton>
        ) : (
          <Link
            to="/login"
            className={itemClass(false)}
            title={!isOpen ? "Sign in" : undefined}
          >
            <FaSignInAlt className="h-5 w-5 shrink-0 text-emerald-300" />
            {isOpen && <span className="truncate">Sign in</span>}
          </Link>
        )}
      </div>
    </aside>
  );
};

export default SideNav;
