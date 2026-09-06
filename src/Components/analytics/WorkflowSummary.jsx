/* eslint-disable react/prop-types */
import { LuChartPie } from "react-icons/lu";
import useUserInfo from "../../CustomHooks/useUserInfo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "./ui";
import WorkflowChart from "./WorkflowChart";

const WorkflowSummary = ({ data, loading }) => {
  const userinfo = useUserInfo();
  return (
    <Card className="min-h-full  min-w-0 shadow-sm">
      <CardHeader>
        <div className="flex gap-2">
          <LuChartPie color="blue" size={19} />
          <CardTitle>Workflow Summary</CardTitle>
        </div>
        <CardDescription>
          Current distribution across all requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-44 w-full min-w-0 items-center justify-center gap-6 overflow-hidden rounded-lg bg-muted/20 sm:h-52">
            <Skeleton className="size-32 shrink-0 rounded-full border-[18px] border-background sm:size-36" />
            <div className="flex w-24 flex-col gap-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ) : (
          <WorkflowChart data={data} role={userinfo.role} />
        )}
      </CardContent>
    </Card>
  );
};
export default WorkflowSummary;
