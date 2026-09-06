/* eslint-disable react/prop-types */
import {
  LuArrowDownRight,
  LuArrowRightFromLine,
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

const statusStyles = {
  approved: {
    card: "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300",
    accent: "bg-emerald-500",
  },

  pending: {
    card: "border-amber-500 bg-amber-50/80 shadow-md shadow-amber-100/70 dark:border-amber-800 dark:bg-amber-950/25 dark:shadow-none",
    text: "text-amber-700 dark:text-amber-300",
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300",
    accent: "bg-amber-500",
  },

  inProgress: {
    card: "border-sky-200/70 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/20",
    text: "text-sky-700 dark:text-sky-300",
    icon: "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300",
    accent: "bg-sky-500",
  },

  rejected: {
    card: "border-rose-200/70 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/20",
    text: "text-rose-700 dark:text-rose-300",
    icon: "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300",
    accent: "bg-rose-500",
  },

  all: {
    card: "border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/30",
    text: "text-slate-700 dark:text-slate-300",
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    accent: "bg-slate-500",
  },
};

const StatusCard = ({ title, value, description, status, trend, loading }) => {
  const Icon = icons[status] || LuLayers3;
  const styles = statusStyles[status] || statusStyles.all;

  const TrendIcon =
    trend === "down"
      ? LuArrowDownRight
      : trend === "neutral"
        ? LuArrowRightFromLine
        : LuArrowUpRight;

  const isPending = status === "pending";

  return (
    <Card
      className={`
        relative min-h-28 overflow-hidden border
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        ${styles.card}
      `}
    >
      {/* Status accent */}
      <span className={`absolute inset-y-0 left-0 w-1 ${styles.accent}`} />

      <CardContent className="flex h-full flex-col justify-between p-3 pl-4 sm:p-4 sm:pl-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {isPending && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-bounce rounded-full bg-amber-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
              </span>
            )}

            <p className={`truncate text-sm font-semibold ${styles.text}`}>
              {title}
            </p>
          </div>

          <span
            className={`
              flex size-9 shrink-0 items-center justify-center
              rounded-lg ring-1 ring-inset ring-black/5
              ${styles.icon}
            `}
          >
            <Icon size={17} strokeWidth={2} />
          </span>
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p
              className={` font-bold leading-none tracking-tight ${title == "Awaiting For Your Approval" ? "text-3xl" : "text-2xl"}`}
            >
              {value}
            </p>
          )}
          {/* {trend && (
            <span
              className={`flex items-center text-xs font-medium ${
                trend === "down"
                  ? "text-rose-600"
                  : trend === "neutral"
                    ? "text-gray-500"
                    : "text-emerald-600"
              }`}
            >
              <TrendIcon size={14} />
              {trend}
            </span>
          )} */}
        </div>
        {loading ? (
          <Skeleton className="mt-2 h-3 w-28" />
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;
