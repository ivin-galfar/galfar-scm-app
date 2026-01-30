import { Link } from "react-router-dom";
import { useDashboardType, useStatusFilter } from "../store/logisticsStore";
import { usePagination } from "../store/statementStore";

const DashboardButton = () => {
  const { dashboardType, setDashboardType } = useDashboardType();
  const { resetStatusFilter } = useStatusFilter();
  const { setPageIndex } = usePagination();

  const dashboards = [
    { key: "plant", label: "Plant", color: "blue", path: "/dashboard" },
    {
      key: "logistics",
      label: "logistics",
      color: "green",
      path: "/dashboardlg",
    },
  ];
  return (
    <div className="flex gap-2  border-gray-300 pb-1">
      {dashboards.map((dash) => (
        <Link
          key={dash.key}
          to={dash.path}
          onClick={() => {
            setDashboardType(dash.key);
            resetStatusFilter();
            setPageIndex(0);
          }}
          className={`
        px-4 py-2 text-sm font-bold transition-colors duration-200
        border-b-2
        ${
          dashboardType === dash.key
            ? dash.color === "blue"
              ? "border-blue-500 text-blue-700"
              : "border-green-500 text-green-700"
            : "border-transparent text-gray-600 hover:text-gray-800"
        }
      `}
        >
          {dash.label}
        </Link>
      ))}
    </div>
  );
};

export default DashboardButton;
