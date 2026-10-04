/* eslint-disable react/prop-types */
import { LuFileText } from "react-icons/lu";
import { AiFillAlert } from "react-icons/ai";

import { Badge, Card, CardContent, Separator } from "./ui";
import ZeroPendings from "../../Components/ZeroPendings";
import DashboardSectionHeader from "./DashboardSectionHeader";

const NearingReminder = ({ items, escalated_times }) => {
  const escalatedCount = Number(escalated_times) || 0;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden shadow-sm">
      <DashboardSectionHeader
        title="Nearing Reminder / Overdue"
        description="Statements approaching their reminder threshold"
        icon={AiFillAlert}
        tone="rose"
        action={
          <div
            className="flex items-center gap-2 rounded-lg border border-rose-200/80 bg-rose-50 px-2.5 py-1.5 text-rose-700 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-300"
            aria-label={`${escalatedCount} reminders escalated for you`}
          >
            <span className="text-[11px] font-semibold leading-tight">
              Reminders esclated to you{" "}
            </span>
            <Badge className="h-5 min-w-5 justify-center rounded-full border-0 bg-rose-600 px-1.5 text-[11px] font-bold text-white dark:bg-rose-500">
              {escalatedCount}
            </Badge>
          </div>
        }
      />
      <CardContent className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-3">
        {items.length ? (
          <div className="max-h-52 min-h-0 space-y-2 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div
                key={`${item.label}-${item.id}`}
                className="rounded-lg px-2 py-0 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/70 text-muted-foreground">
                    <LuFileText size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.due_period && (
                        <Badge className="border-orange-200 bg-orange-50 font-semibold text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300">
                          {item.due_period} hrs
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[item.label]
                        .filter((value) => value && value !== "-")
                        .join(" · ") || "Details unavailable"}
                    </p>
                  </div>
                </div>
                {index < items.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <ZeroPendings
              message={"All statements are within their required timelines."}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default NearingReminder;
