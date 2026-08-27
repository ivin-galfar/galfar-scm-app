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
import { formatDateDMY } from "../../Helpers/helperfunctions";

const PendingForYou = ({ items }) => (
  <Card className="flex h-full min-h-0 flex-col shadow-sm">
    <CardHeader className="shrink-0 flex-row items-start justify-between gap-3 space-y-0 p-4 pb-3">
      <div>
        <CardTitle>Pending for You</CardTitle>
        <CardDescription className="mt-1">
          Requests that require your attention
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
                    <Badge className="border-rose-200 bg-rose-50 text-rose-700 justify-center">
                      {item.status
                        .split(" ")
                        .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
                        .join(" ")}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.label || "--"}
                  </p>
                </div>
              </div>
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

export default PendingForYou;
