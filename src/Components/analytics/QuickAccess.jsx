/* eslint-disable react/prop-types */
import {
  LuArrowLeftRight,
  LuArrowUpRight,
  LuFileText,
  LuPackage,
  LuTruck,
  LuUserPlus,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import { useDashboardType } from "../../store/logisticsStore";
import { Card, CardContent, CardHeader, CardTitle } from "./ui";
import { FaToolbox } from "react-icons/fa";

const actions = [
  {
    label: "Hire CS",
    icon: FaToolbox,
    path: "/dashboard",
    type: "hiring",
    tone: "text-blue-700 bg-blue-50 ",
  },
  {
    label: "Asset CS",
    icon: LuPackage,
    path: "/dashboard",
    type: "asset",
    tone: "text-violet-700 bg-violet-50",
  },
  {
    label: "Logistics CS",
    icon: LuTruck,
    path: "/dashboardlg",
    type: "logistics",
    tone: "text-emerald-700 bg-emerald-50",
  },
  {
    label: "File Note / IOC",
    icon: LuFileText,
    path: "/dashboardfn",
    type: "fn",
    tone: "text-sky-700 bg-sky-50",
  },
  {
    label: "BVR (Buy vs Rent)",
    icon: LuArrowLeftRight,
    path: "/dashboardbr",
    type: "bvrplant",
    tone: "text-orange-700 bg-orange-50",
  },
];
const QuickAccess = ({ items = actions }) => {
  const { setDashboardType } = useDashboardType();
  return (
    <Card className="h-full shadow-sm ">
      <CardHeader className="p-4 pb-3">
        <CardTitle>Quick Access</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 p-3 pt-0">
        {items.map(({ label, icon: Icon, path, type, tone }) => (
          <Link
            key={label}
            to={path}
            onClick={() => setDashboardType(type)}
            className={`group flex aspect-square w-30 flex-col items-center justify-center gap-2 rounded-lg border border-border/60  p-2 text-center transition-all hover:-translate-y-0.5  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone}`}
          >
            <Icon size={30} />

            <span className="truncate text-xs font-medium">{label}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};
export default QuickAccess;
{
  /* <Link
  key={label}
  to={path}
  onClick={() => setDashboardType(type)}
  className={`group flex aspect-square w-32 flex-col items-center justify-center gap-2 rounded-lg border border-border/60  p-2 text-center transition-all hover:-translate-y-0.5  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone}`}
></Link>; */
}
