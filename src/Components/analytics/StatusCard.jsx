/* eslint-disable react/prop-types */
import {
  LuArrowDownRight,
  LuArrowUpRight,
  LuCircleCheck,
  LuCircleDot,
  LuCircleX,
  LuLayers3,
  LuTimer,
} from "react-icons/lu";
import { Card, CardContent, Skeleton } from "./ui";

const icons = {
  approved: LuCircleCheck,
  pending: LuTimer,
  inProgress: LuCircleDot,
  rejected: LuCircleX,
  all: LuLayers3,
};
const tones = {
  approved: "text-emerald-700 bg-emerald-50",
  pending: "text-amber-700 bg-amber-50",
  inProgress: "text-sky-700 bg-sky-50",
  rejected: "text-rose-700 bg-rose-50",
  all: "text-slate-700 bg-slate-100",
};

const StatusCard = ({ title, value, description, status, trend, loading }) => {
  const Icon = icons[status] || LuLayers3;
  const TrendIcon =
    trend?.direction === "down" ? LuArrowDownRight : LuArrowUpRight;
  return (
    <Card className="min-h-28 shadow-sm">
      <CardContent className="flex h-full flex-col justify-between p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <span
            className={`flex size-8 items-center justify-center rounded-md ${tones[status]}`}
          >
            <Icon size={17} />
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          )}
          {trend && (
            <span
              className={`flex items-center text-xs font-medium ${trend.direction === "down" ? "text-rose-600" : "text-emerald-600"}`}
            >
              <TrendIcon />
              {trend.value}
            </span>
          )}
        </div>
        {loading ? (
          <Skeleton className="mt-1 h-3 w-28" />
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;
