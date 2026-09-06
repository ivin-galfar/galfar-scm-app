/* eslint-disable react/prop-types */
import { LuArrowRight, LuLayoutDashboard } from "react-icons/lu";
import { Button, Card, CardContent } from "./ui";
import { IoBarChartSharp } from "react-icons/io5";

const DashboardPlaceholder = ({
  title = "Coming Soon",
  description = "This workspace is ready for a future dashboard widget.",
  action,
}) => (
  <Card className="h-full min-h-44 shadow-sm transition-colors hover:border-border/90">
    <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/70 text-muted-foreground shadow-sm">
        <IoBarChartSharp size={18} />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-52 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button variant="outline" className="mt-4">
          {action}
          <LuArrowRight />
        </Button>
      )}
    </CardContent>
  </Card>
);
export default DashboardPlaceholder;
