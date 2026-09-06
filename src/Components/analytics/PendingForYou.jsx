/* eslint-disable react/prop-types */
import { LuArrowRight, LuClock3 } from "react-icons/lu";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

const PendingForYou = ({ items, pending_count = 0 }) => {
  const userInfo = useUserInfo();
  const { setIsClicked } = useClickFromDashboard();
  const isAdmin = userInfo?.is_admin;
  const roles = userInfo?.role || [];
  console.log(items);

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
    <Card className="flex h-full min-h-10 flex-col shadow-sm">
      <CardHeader className="shrink-0 flex-row items-start justify-between gap-3 space-y-0 p-4 pb-3">
        <div>
          <span className="flex gap-3">
            <CardTitle className="flex gap-2 items-center">
              <MdPendingActions size={19} className="text-amber-500" />
              {initiatorRoles.some((r) => userInfo.role.includes(r)) ||
              userInfo.role.every((role) => role === "initfn")
                ? "Pending Statements"
                : "Awaiting your Action"}
            </CardTitle>
            {filteredItems.length > 0 && (
              <Badge className="min-w-5 h-5 px-1.5 rounded-t-lg bg-red-500 text-white items-center text-xs font-semibold border-0">
                {filteredItems.length}
              </Badge>
            )}
          </span>
          <CardDescription className="mt-1">
            {initiatorRoles.some((r) => userInfo.role.includes(r)) ||
            userInfo.role.every((role) => role === "initfn")
              ? "Statments which are still in progress"
              : "Requests that require your attention"}
          </CardDescription>
        </div>
        <Link
          to="/pendingdashboard"
          className="flex  shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md border px-2 py-1 text-sm font-semibold text-gray-600 transition hover:bg-accent hover:text-accent-foreground"
          onClick={setIsClicked}
        >
          View All
          <LuArrowRight />
        </Link>
        {/* </Button> */}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
        {filteredItems.length ? (
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
                          .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
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
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing is waiting for your attention.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingForYou;
