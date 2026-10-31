/* eslint-disable react/prop-types */
import { LuArrowRight, LuClock3 } from "react-icons/lu";
import {
  Badge,
  Card,
  CardContent,
  Skeleton,
  Separator,
} from "./ui";
import {
  formatDateDMY,
  getPath,
  initiatorRoles,
} from "../../Helpers/helperfunctions";
import { FaSquareArrowUpRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import useUserInfo from "../../CustomHooks/useUserInfo";
import { useClickFromDashboard } from "../../store/helperStore";
import { FiFileText } from "react-icons/fi";
import { MdPendingActions } from "react-icons/md";
import ZeroPendings from "../../Components/ZeroPendings";
import DashboardSectionHeader from "./DashboardSectionHeader";

const PendingForYou = ({ items, loading, isError }) => {
  const userInfo = useUserInfo();
  const { setIsClicked } = useClickFromDashboard();
  const isAdmin = userInfo?.is_admin;
  const roles = userInfo?.role || [];
  const isInitiator =
    initiatorRoles.some((role) => roles.includes(role)) ||
    roles.every((role) => role === "initfn") ||
    roles.every((role) => role === "initfr");

  const filteredItems = isAdmin
    ? items
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .filter((item) => {
          if (!roles.includes("inith") && !roles.includes("inita")) {
            return true;
          }
          if (roles.includes("inith")) {
            return item.type === "hiring";
          }

          if (roles.includes("inita")) {
            return item.type === "asset" || item.type === "buyvsrent";
          }

          return false;
        })
    : items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <Card
      className={`relative flex h-full min-h-10 flex-col overflow-hidden shadow-sm border-amber-200/80 bg-amber-50/35 dark:border-amber-900/60 dark:bg-amber-950/15"`}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-amber-400" />
      <DashboardSectionHeader
        title={isInitiator ? "Pending Statements" : "Awaiting Your Action"}
        description={
          isInitiator
            ? "Statements which are still in progress"
            : "Requests that require your attention"
        }
        icon={MdPendingActions}
        tone="amber"
        badge={
          filteredItems.length > 0 ? (
            <Badge className="h-5 min-w-5 rounded-full border-0 bg-amber-600 px-1.5 text-[11px] font-semibold text-white">
              {filteredItems.length}
            </Badge>
          ) : null
        }
        action={
          <Link
            to="/pendingdashboard"
            className="flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-accent hover:text-accent-foreground dark:text-slate-300"
            onClick={setIsClicked}
          >
            View All
            <LuArrowRight />
          </Link>
        }
      />
      <CardContent className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-3">
        {loading ? (
          <div
            className="max-h-60 space-y-4 overflow-hidden px-2 py-2"
            aria-label="Loading pending items"
            aria-busy="true"
          >
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Pending items could not be loaded.
          </div>
        ) : filteredItems.length ? (
          <div className="max-h-60 min-h-0 space-y-2 overflow-y-auto pr-1">
            {filteredItems.map((item, index) => (
              <div
                key={`${item.source}-${item.id}`}
                className="rounded-lg px-2 py-1 transition-colors hover:bg-muted/80"
              >
                <Link
                  className="flex items-start gap-3"
                  onClick={setIsClicked}
                  // className="group flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"

                  to={`${getPath(item.label)}/${item.id}`}
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-r-2xl border border-blue-200/70 bg-blue-50 text-blue-600 shadow-sm">
                    <FiFileText size={20} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-[1fr_1fr_0.6fr] ">
                      <p className="min-w-0 truncate text-sm font-medium">
                        {item.name !== "-" ? item.name : item.number}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground pl-3">
                        <LuClock3 size={12} />
                        {item.created_at !== "-"
                          ? formatDateDMY(item.created_at)
                          : item.created_date}
                      </p>
                      <Badge className="justify-center  border-rose-200 bg-rose-50 font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                        {item.status
                          .split(" ")
                          .map((v, i) =>
                            i === 2
                              ? v?.toUpperCase()
                              : v?.charAt(0).toUpperCase() + v.slice(1),
                          )
                          .join(" ")}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground flex justify-between h-4">
                      {item.label || "--"}

                      <span
                        type="button"
                        className="flex shrink-0 items-center gap-1 rounded-sm border border-orange-200 bg-orange-50 px-2 text-[11px] font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
                      >
                        View
                        <FaSquareArrowUpRight
                          size={13}
                          className="scale-x-105"
                        />
                      </span>
                    </p>
                  </div>
                </Link>
                {index < items.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <ZeroPendings
              message={"Great job! All statements have been approved."}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingForYou;
