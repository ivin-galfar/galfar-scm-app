/* eslint-disable react/prop-types */
import {
  LuArrowLeftRight,
  LuCarFront,
  LuChevronDown,
  LuFileText,
  LuPackage,
  LuPlus,
  LuTruck,
} from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDashboardType } from "../../store/logisticsStore";
import { Card, CardContent } from "./ui";
import { FaToolbox } from "react-icons/fa";
import { useQuickAccess } from "../../store/helperStore";
import { TbHomeMove } from "react-icons/tb";
import useUserInfo from "../../CustomHooks/useUserInfo";
import { initiatorRoles } from "../../Helpers/helperfunctions";
import DashboardSectionHeader from "./DashboardSectionHeader";
import { getInitiatorCreationOptions } from "../../Helpers/initiatorCapabilities";
import {
  getFnIocDashboardPath,
  getProjectIocAccess,
} from "../../Helpers/projectIocAccess";
import { getModuleNavigationAccess } from "../../Helpers/navigationPermissions";
import { getFleetRequestAccess } from "../../Helpers/fleetRequestPermissions";

const actions = [
  {
    label: "Hire CS",
    icon: FaToolbox,
    path: "/dashboard",
    type: "hiring",
    tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    label: "Asset CS",
    icon: LuPackage,
    path: "/dashboard",
    type: "asset",
    tone: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  },
  {
    label: "Logistics CS",
    icon: LuTruck,
    path: "/dashboardlg",
    type: "logistics",
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    label: "File Note / IOC",
    icon: LuFileText,
    path: "/dashboardfn",
    type: "fn",
    tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
  {
    label: "BVR (Buy vs Rent)",
    icon: LuArrowLeftRight,
    path: "/dashboardbr",
    type: "bvrplant",
    tone: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  },
  {
    label: "Fleet Request",
    icon: LuCarFront,
    path: "/dashboardfr",
    type: "bvrplant",
    tone: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  },
];
const QuickAccess = ({ items = actions }) => {
  const { setDashboardType } = useDashboardType();
  const { setIsClicked } = useQuickAccess();
  const userInfo = useUserInfo();
  const navigate = useNavigate();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const userRoles = userInfo?.role || [];
  const hasRole = (role) => userRoles.includes(role);
  const initiatorCreationOptions = getInitiatorCreationOptions(userRoles);
  const fnIocDashboardPath = getFnIocDashboardPath(userInfo);
  const navigationAccess = getModuleNavigationAccess(userInfo);
  const projectIocAccess = getProjectIocAccess(userInfo);
  const canAccessFnIoc = projectIocAccess.isProjectScoped
    ? navigationAccess.canAccessProjects && projectIocAccess.canAccess
    : navigationAccess.canAccessPlant && navigationAccess.canAccessFNIOC;
  const canAccessFleetRequest =
    navigationAccess.canAccessProjects &&
    getFleetRequestAccess(userInfo).canAccess;
  const isInitiator =
    initiatorRoles.some((r) => userRoles.includes(r)) ||
    userRoles.every((role) => role === "initfn");
  const createAction = hasRole("inith")
    ? "receipts"
    : hasRole("inita")
      ? "asset-menu"
      : hasRole("initlg")
        ? "logistics"
        : initiatorCreationOptions.length
          ? "initiator-options"
          : null;

  const navigateToCreate = (path, intent, defaults = {}) => {
    setIsCreateMenuOpen(false);
    navigate(path, { state: { createNew: intent, ...defaults } });
  };

  const canAccessAction = ({ path, type }) => {
    if (!userInfo) return true;
    if (type === "hiring" || type === "asset") {
      return (
        navigationAccess.canAccessPlant && navigationAccess.canAccessHiringAsset
      );
    }
    if (type === "logistics") return navigationAccess.canAccessLogistics;
    if (type === "fn") return canAccessFnIoc;
    if (path === "/dashboardbr") {
      return (
        navigationAccess.canAccessPlant && navigationAccess.canAccessBuyVsRent
      );
    }
    if (path === "/dashboardfr") return canAccessFleetRequest;
    return true;
  };

  const orderedItems = items
    .map((item, index) => ({
      ...item,
      canAccess: canAccessAction(item),
      originalIndex: index,
    }))
    .sort(
      (first, second) =>
        Number(second.canAccess) - Number(first.canAccess) ||
        first.originalIndex - second.originalIndex,
    );

  const renderCreateAction = () => {
    if (!createAction) return null;

    if (
      createAction === "asset-menu" ||
      (createAction === "initiator-options" &&
        initiatorCreationOptions.length > 1)
    ) {
      const menuOptions =
        createAction === "asset-menu"
          ? [
              {
                key: "asset",
                label: "Asset",
                path: "/receipts",
                intent: "receipts",
              },
              {
                key: "bvr",
                label: "Buy vs Rent",
                path: "/brstatement",
                intent: "bvr",
              },
              {
                key: "filenote",
                label: "File Note / IOC",
                path: "/filenote",
                intent: "filenote",
              },
            ]
          : initiatorCreationOptions;
      return (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCreateMenuOpen((open) => !open)}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-blue-700 bg-white px-3 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-expanded={isCreateMenuOpen}
            aria-haspopup="menu"
          >
            <LuPlus size={18} />
            Create New
            <LuChevronDown size={18} />
          </button>
          {isCreateMenuOpen && (
            <div
              className="absolute right-0 z-20 mt-2 w-36 rounded-lg border border-border bg-background p-1 shadow-lg"
              role="menu"
            >
              {menuOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() =>
                    navigateToCreate(option.path, option.intent, {
                      type: option.type,
                      category: option.category,
                    })
                  }
                  role="menuitem"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    const destinations = {
      receipts: ["/receipts", "receipts"],
      logistics: ["/lstatements", "logistics"],
      fleetrequest: ["/fleetrequest", "fleetrequest"],
      filenote: ["/filenote", "filenote"],
    };
    const directOption =
      createAction === "initiator-options" ? initiatorCreationOptions[0] : null;
    const [path, intent] = directOption
      ? [directOption.path, directOption.intent]
      : destinations[createAction];

    return (
      <button
        type="button"
        onClick={() =>
          navigateToCreate(path, intent, {
            type: directOption?.type,
            category: directOption?.category,
          })
        }
        className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-blue-700 bg-white px-3 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        <LuPlus size={18} />
        Create New
      </button>
    );
  };

  return (
    <Card className="h-full  overflow-hidden shadow-sm">
      <DashboardSectionHeader
        title="Quick Access"
        description="Open frequently used workspaces"
        icon={TbHomeMove}
        tone="emerald"
        action={isInitiator ? renderCreateAction() : null}
      />
      <CardContent className="ml-2 grid translate-y-1 grid-cols-3 gap-2 justify-items-center  px-6 pb-2 pt-2">
        {orderedItems.map(
          ({ label, icon: Icon, path, type, tone, canAccess }) => {
            return (
              <Link
                key={label}
                to={type === "fn" ? fnIocDashboardPath : path}
                aria-disabled={!canAccess}
                title={
                  canAccess ? undefined : "Unavailable for your current role"
                }
                onClick={(event) => {
                  if (!canAccess) {
                    event.preventDefault();
                    return;
                  }
                  setDashboardType(type);
                  setIsClicked();
                }}
                className={`group flex aspect-square w-30 flex-col items-center justify-center gap-2 rounded-lg border p-2 text-center shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  canAccess
                    ? `border-border/60 hover:-translate-y-0.5 hover:border-border hover:shadow-md ${tone}`
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60"
                }`}
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-xl bg-background/60 shadow-sm transition-transform duration-200 ${
                    canAccess ? "group-hover:scale-105" : ""
                  }`}
                >
                  <Icon size={22} />
                </span>

                <span className="truncate text-[11px] font-semibold">
                  {label}
                </span>
              </Link>
            );
          },
        )}
      </CardContent>
    </Card>
  );
};
export default QuickAccess;
