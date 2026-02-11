import { Link } from "react-router-dom";
import { useDashboardType, useStatusFilter } from "../store/logisticsStore";
import { usePagination } from "../store/statementStore";
import { is_asset, is_buyvsrent, is_fm } from "../Helpers/dept_helper";
import useUserInfo from "../CustomHooks/useUserInfo";

const DashboardButton = () => {
  const { dashboardType, setDashboardType } = useDashboardType();
  const { resetStatusFilter } = useStatusFilter();
  const { setPageIndex } = usePagination();
  const userInfo = useUserInfo();
  const isasset = is_asset(userInfo?.role);
  const isbuyvsrent = is_buyvsrent(userInfo?.role);
  const isfm = is_fm(userInfo?.role);

  const colorMap = {
    plant: {
      border: "border-blue-500",
      text: "text-blue-600",
      hover: "hover:text-blue-700",
    },
    logistics: {
      border: "border-emerald-500",
      text: "text-emerald-600",
      hover: "hover:text-emerald-700",
    },
    plantbr: {
      border: "border-amber-500",
      text: "text-amber-600",
      hover: "hover:text-amber-700",
    },
  };

  const dashboards = [
    {
      key: "plant",
      label: "Hiring/Asset",
      path: "/dashboard",
    },
    {
      key: "plantbr",
      label: "Buy Vs Rent",
      path: "/dashboardbr",
    },
    {
      key: "logistics",
      label: "Logistics",
      path: "/dashboardlg",
    },
  ].filter((dash) => {
    if (isasset || isbuyvsrent) {
      return dash.key !== "logistics";
    }
    if (isfm) {
      return dash.key !== "plant";
    }
    return true;
  });

  return (
    <div className="flex gap-2 border-gray-300 pb-1">
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
              px-4 py-2 text-sm font-bold transition-colors duration-200 border-b-2
              ${
                isActive
                  ? `${colors.border} ${colors.text}`
                  : `border-transparent text-gray-600 hover:text-gray-800 ${colors.hover}`
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
