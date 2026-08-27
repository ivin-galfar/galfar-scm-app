/* eslint-disable react/prop-types */
import { LuArrowRight, LuClock3, LuFileText } from "react-icons/lu";
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

const NearingReminder = ({ items }) => (
  <Card className="flex h-full min-h-0 flex-col shadow-sm">
    <CardHeader className="shrink-0 flex-row items-start justify-between gap-3 space-y-0 p-4 pb-3">
      <div>
        <CardTitle>Nearing Reminder</CardTitle>
        <CardDescription className="mt-1">
          Statements approaching reminder
        </CardDescription>
      </div>
      <Button variant="outline" className="shrink-0">
        View all <LuArrowRight />
      </Button>
    </CardHeader>
    <CardContent className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
      {items.length ? (
        <div className="max-h-52 min-h-0 space-y-2 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div key={`${item.type}-${item.id}`}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <LuFileText size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.due_period && (
                      <Badge className="border-orange-200 bg-orange-50 text-orange-700">
                        {item.due_period} hrs
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[item.label]
                      .filter((value) => value && value !== "-")
                      .join(" · ") || "Details unavailable"}
                  </p>
                  {/* <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <LuClock3 size={12} />
                    {item.age}
                  </p> */}
                </div>
              </div>
              {index < items.length - 1 && <Separator className="mt-2" />}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No reminders are currently due.
        </p>
      )}
    </CardContent>
  </Card>
);
export default NearingReminder;
