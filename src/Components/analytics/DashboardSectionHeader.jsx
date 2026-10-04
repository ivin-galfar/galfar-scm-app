/* eslint-disable react/prop-types */
import { CardDescription, CardHeader, CardTitle } from "./ui";

const toneStyles = {
  amber:
    "border-amber-200/70 bg-amber-50/70 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-300",
  blue: "border-sky-200/70 bg-sky-50/70 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/25 dark:text-sky-300",
  emerald:
    "border-emerald-200/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300",
  rose: "border-rose-200/70 bg-rose-50/70 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/25 dark:text-rose-300",
  violet:
    "border-violet-200/70 bg-violet-50/70 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/25 dark:text-violet-300",
};

const DashboardSectionHeader = ({
  title,
  description,
  icon: Icon,
  tone = "blue",
  badge,
  action,
  className = "",
}) => (
  <CardHeader
    className={`shrink-0 flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 bg-slate-50/80 px-4 py-3 dark:bg-slate-900/40 ${className}`}
  >
    <div className="flex min-w-0 items-center gap-3">
      {Icon && (
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg border shadow-sm ${toneStyles[tone] || toneStyles.blue}`}
        >
          <Icon aria-hidden="true" size={18} />
        </span>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <CardTitle className="truncate text-[15px] font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </CardTitle>
          {badge}
        </div>
        {description && (
          <CardDescription className="mt-0.5 leading-4">
            {description}
          </CardDescription>
        )}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </CardHeader>
);

export default DashboardSectionHeader;
