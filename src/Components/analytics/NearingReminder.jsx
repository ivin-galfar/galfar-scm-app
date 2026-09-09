/* eslint-disable react/prop-types */
import { LuArrowRight, LuFileText } from "react-icons/lu";
import { AiFillAlert } from "react-icons/ai";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Separator,
} from "./ui";
import ZeroPendings from "../../Components/ZeroPendings";

const NearingReminder = ({ items, escalated_times }) => {
  return (
    <Card className="flex h-full min-h-0 flex-col shadow-sm">
      <div className="shrink-0 flex-row items-start justify-between gap-3 space-y-0 p-4 pb-3">
        <div className="w-full">
          <span className="justify-between flex">
            <div className="flex gap-2">
              <AiFillAlert color="red" size={19} />
              <CardTitle>Nearing Reminder / Overdue</CardTitle>
            </div>
            {/* <CardTitle> //PHASE II
            Escalations Triggered for you : {escalated_times}{" "}
          </CardTitle> */}
          </span>
          <CardDescription className="mt-1">
            Statements approaching reminder
          </CardDescription>
        </div>
        {/* <Button variant="outline" className="shrink-0">
        View all <LuArrowRight />
      </Button> */}
      </div>
      <CardContent className="min-h-0  flex-1 overflow-hidden px-4 pb-4">
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
