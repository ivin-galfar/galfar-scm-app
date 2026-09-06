/* eslint-disable react/prop-types */
import {
  LuArrowLeftRight,
  LuFileText,
  LuPackage,
  LuTruck,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import { useDashboardType } from "../../store/logisticsStore";
import { Card, CardContent, CardHeader, CardTitle } from "./ui";
import { FaToolbox } from "react-icons/fa";
import { useQuickAccess } from "../../store/helperStore";
import { TbHomeMove } from "react-icons/tb";

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
  const { dashboardType, setDashboardType } = useDashboardType();
  const { isClicked, setIsClicked } = useQuickAccess();
  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="flex gap-2">
          <TbHomeMove
            size={19}
            className="transition-transform duration-200 group-hover:scale-110"
            color="green"
          />
          Quick Access{" "}
        </CardTitle>
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
