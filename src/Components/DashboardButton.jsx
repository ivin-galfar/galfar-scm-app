import { Link } from "react-router-dom";
import { useDashboardType, useStatusFilter } from "../store/logisticsStore";
import { usePagination } from "../store/statementStore";
import { is_asset, is_fm, is_hod, is_pd, is_pm } from "../Helpers/dept_helper";
import useUserInfo from "../CustomHooks/useUserInfo";

const DashboardButton = () => {
  const { dashboardType, setDashboardType } = useDashboardType();
  const { resetStatusFilter } = useStatusFilter();
  const { setPageIndex } = usePagination();
  const userInfo = useUserInfo();
  const isasset = is_asset(userInfo?.role);
  const isfm = is_fm(userInfo?.role);
  const ishod = is_hod(userInfo?.role);
  const ispm = is_pm(userInfo.role);
  const ispd = is_pd(userInfo.role);

  const colorMap = {
    hiring: {
      border: "border-blue-500",
      text: "text-blue-600",
      hover: "hover:text-blue-700",
    },
    asset: {
      border: "border-violet-500",
      text: "text-violet-600",
      hover: "hover:text-violet-700",
    },
    logistics: {
      border: "border-emerald-500",
      text: "text-emerald-600",
      hover: "hover:text-emerald-700",
    },
    bvrplant: {
      border: "border-orange-500",
      text: "text-orange-600",
      hover: "hover:text-orange-700",
    },
  };

  const dashboards = [
    {
      key: "hiring",
      label: "Hiring CS",
      path: "/dashboard",
    },
    {
      key: "asset",
      label: "Asset CS",
      path: "/dashboard",
    },
    {
      key: "bvrplant",
      label: "Buy Vs Rent",
      path: "/dashboardbr",
    },
    {
      key: "logistics",
      label: "Logistics",
      path: "/dashboardlg",
    },
  ].filter((dash) => {
    if (ispm || ispd) {
      return dash.key === "logistics";
    }
    if (isasset) {
      return dash.key !== "logistics" && dash.key !== "hiring";
    }
    if (isfm) {
      return dash.key !== "hiring" && dash.key !== "asset";
    }
    return true;
  });

  return (
    <div className="flex h-8 items-center gap-1 rounded-lg bg-slate-100 p-1">
      {dashboards.map((dash) => {
        const colors = colorMap[dash.key];
        const isActive = dashboardType === dash.key;

        return (
          <Link
            key={dash.key}
            to={dash.path}
            onClick={() => {
              setDashboardType(dash.key);
              resetStatusFilter();
              setPageIndex(0);
            }}
            className={`
              inline-flex h-6 items-center whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition-colors duration-200
              ${
                isActive
                  ? `bg-white shadow-sm ${colors.text}`
                  : `text-gray-600 hover:bg-white/70 hover:text-gray-800 ${colors.hover}`
              }
            `}
          >
            {dash.label}
          </Link>
        );
      })}
    </div>
  );
};

export default DashboardButton;
