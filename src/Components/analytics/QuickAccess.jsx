/* eslint-disable react/prop-types */
import {
  LuArrowLeftRight,
  LuChevronDown,
  LuFileText,
  LuPackage,
  LuPlus,
  LuTruck,
} from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDashboardType } from "../../store/logisticsStore";
import { Card, CardContent, CardHeader, CardTitle } from "./ui";
import { FaToolbox } from "react-icons/fa";
import { useQuickAccess } from "../../store/helperStore";
import { TbHomeMove } from "react-icons/tb";
import useUserInfo from "../../CustomHooks/useUserInfo";
import { initiatorRoles } from "../../Helpers/helperfunctions";

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
];
const QuickAccess = ({ items = actions }) => {
  const { setDashboardType } = useDashboardType();
  const { setIsClicked } = useQuickAccess();
  const userInfo = useUserInfo();
  const navigate = useNavigate();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const userRoles = userInfo?.role || [];
  const hasRole = (role) => userRoles.includes(role);
  const isInitiator =
    initiatorRoles.some((r) => userRoles.includes(r)) ||
    userRoles.every((r) => r == "initfn");
  const createAction = hasRole("inith")
    ? "receipts"
    : hasRole("inita")
      ? "asset-menu"
      : hasRole("initlg")
        ? "logistics"
        : ["initpr", "initdc", "initfn"].some(hasRole)
          ? "filenote"
          : null;

  const navigateToCreate = (path, intent) => {
    setIsCreateMenuOpen(false);
    navigate(path, { state: { createNew: intent } });
  };

  const renderCreateAction = () => {
    if (!createAction) return null;

    if (createAction === "asset-menu") {
      return (
        <div className="relative">
          <span
            type="button"
            onClick={() => setIsCreateMenuOpen((open) => !open)}
            className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-blue-700 bg-white px-3 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-expanded={isCreateMenuOpen}
            aria-haspopup="menu"
          >
            <LuPlus size={18} />
            Create New
            <LuChevronDown size={18} />
          </span>
          {isCreateMenuOpen && (
            <div
              className="absolute right-0 z-20 mt-2 w-36 rounded-lg border border-border bg-background p-1 shadow-lg"
              role="menu"
            >
              <button
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-sm cursor-pointer hover:bg-muted"
                onClick={() => navigateToCreate("/receipts", "receipts")}
                role="menuitem"
              >
                Asset
              </button>
              <button
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted cursor-pointer"
                onClick={() => navigateToCreate("/brstatement", "bvr")}
                role="menuitem"
              >
                Buy vs Rent
              </button>
            </div>
          )}
        </div>
      );
    }

    const destinations = {
      receipts: ["/receipts", "receipts"],
      logistics: ["/lstatements", "logistics"],
      filenote: ["/filenote", "filenote"],
    };
    const [path, intent] = destinations[createAction];

    return (
      <span
        type="button"
        onClick={() => navigateToCreate(path, intent)}
        className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-blue-700 bg-white px-3 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        <LuPlus size={18} />
        Create New
      </span>
    );
  };

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="p-4 pb-3">
        <div className="flex justify-between">
          <CardTitle className="flex gap-2">
            <TbHomeMove
              size={19}
              className="transition-transform duration-200 group-hover:scale-110"
              color="green"
            />
            Quick Access{" "}
          </CardTitle>
          {isInitiator && renderCreateAction()}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 p-3 pt-0">
        {items.map(({ label, icon: Icon, path, type, tone }) => (
          <Link
            key={label}
            to={path}
            onClick={() => {
              setDashboardType(type);
              setIsClicked();
            }}
            className={`group flex aspect-square w-30 flex-col items-center justify-center gap-2 rounded-lg border border-border/60 p-2 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone}`}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-background/60 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Icon size={22} />
            </span>

            <span className="truncate text-[11px] font-semibold">{label}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};
export default QuickAccess;
