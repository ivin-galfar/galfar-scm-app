const ACTIVE_STATUS_CLASSES = {
  Approved: "bg-emerald-600 text-white shadow-sm shadow-emerald-900/10",
  Rejected: "bg-rose-600 text-white shadow-sm shadow-rose-900/10",
  Pending: "bg-amber-600 text-white shadow-sm shadow-amber-900/10",
  "Under Review": "bg-cyan-600 text-white shadow-sm shadow-cyan-900/10",
};

const INACTIVE_STATUS_CLASSES = {
  Approved: "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
  Rejected: "text-rose-700 hover:bg-rose-50 hover:text-rose-800",
  Pending: "text-slate-500 hover:bg-white/70 hover:text-amber-700",
  "Under Review": "text-slate-500 hover:bg-white/70 hover:text-cyan-700",
};

const BASE_CLASSES =
  "cursor-pointer rounded-md px-2.5 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none sm:px-3";

export const getDashboardStatusTabClass = (tab, isActive) => {
  const colorClasses = isActive
    ? ACTIVE_STATUS_CLASSES[tab] ??
      "bg-blue-600 text-white shadow-sm shadow-blue-900/10"
    : INACTIVE_STATUS_CLASSES[tab] ??
      "text-slate-500 hover:bg-white/70 hover:text-slate-800";

  return `${BASE_CLASSES} ${colorClasses}`;
};
