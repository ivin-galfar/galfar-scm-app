/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import { LuCircleAlert, LuRefreshCw } from "react-icons/lu";
import { GetAnalyticsData } from "../../APIs/api";
import useUserInfo from "../../CustomHooks/useUserInfo";
import DashboardPlaceholder from "./DashboardPlaceholder";
import NearingReminder from "./NearingReminder";
import PendingForYou from "./PendingForYou";
import QuickAccess from "./QuickAccess";
import StatusSummary from "./StatusSummary";
import { Button, Card, CardContent } from "./ui";
import { transformAnalyticsData } from "./transformAnalyticsData";
import WorkflowSummary from "./WorkflowSummary";

const emptyAnalytics = {
  summary: { approved: 0, pending: 0, inProgress: 0, rejected: 0, all: 0 },
  pendingForYou: [],
  nearingReminder: [],
  workflowSummary: [],
};

const buildStatuses = (summary) => [
  {
    title: "Total Approved",
    value: summary.total_approved,
    description: "Total approved",
    status: "approved",
  },
  {
    title: "Pending for You",
    value: summary.pending,
    description: "Awaiting action",
    status: "pending",
  },
  {
    title: "In Progress",
    value: summary.inProgress,
    description: "Currently processing",
    status: "inProgress",
  },
  {
    title: "Rejected",
    value: summary.total_rejected,
    description: "Total rejected",
    status: "rejected",
  },
  {
    title: "All",
    value: summary.all,
    description: "Total statements",
    status: "all",
  },
];

const DashboardError = ({ onRetry }) => (
  <Card className="border-rose-200 bg-rose-50/60">
    <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm text-rose-800">
      <LuCircleAlert className="shrink-0" />
      <span className="flex-1">
        Analytics data could not be loaded. Please try again.
      </span>
      <Button
        variant="outline"
        onClick={onRetry}
        className="border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
      >
        <LuRefreshCw /> Retry
      </Button>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const userInfo = useUserInfo();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics-approvals", userInfo?.token],
    queryFn: () => GetAnalyticsData(userInfo),
    enabled: !!userInfo,
    select: transformAnalyticsData,
  });
  const analyticsData = data || emptyAnalytics;
  const statuses = buildStatuses(analyticsData.summary);
  console.log("data", analyticsData);

  return (
    <main className="min-w-0 min-h-0 flex-1 overflow-x-hidden bg-muted/30 px-3 py-4 sm:px-5 lg:h-full lg:px-6 lg:py-3">
      <div className="mx-auto min-w-0 max-w-[1500px] space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              Analytics dashboard
            </h1>

            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Operations overview
            </span>
          </div>
        </div>
        {isError && <DashboardError onRetry={refetch} />}
        <StatusSummary statuses={statuses} loading={isLoading} />
        <section
          className="grid grid-cols-2 gap-3 lg:grid-cols-1 xl:grid-cols-6"
          aria-label="Work requiring attention"
        >
          <div className="min-w-0 xl:col-span-3">
            <PendingForYou items={analyticsData.pendingForYou} />
          </div>
          <div className="min-w-0 xl:col-span-2">
            <QuickAccess />
          </div>
          <div className="min-w-0 xl:col-span-1">
            <DashboardPlaceholder />
          </div>
        </section>
        <section
          className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-5"
          aria-label="Workflow analysis"
        >
          <div className="min-w-0 xl:col-span-2">
            <WorkflowSummary data={analyticsData.workflowSummary} />
          </div>
          <div className="min-w-0 xl:col-span-2">
            <NearingReminder items={analyticsData.nearingReminder} />
          </div>
          <div className="min-w-0">
            <DashboardPlaceholder
              title="More insights"
              description="Additional workflow insights will appear here when available."
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
