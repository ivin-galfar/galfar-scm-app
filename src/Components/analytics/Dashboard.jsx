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
import { getGreeting, initiatorRoles } from "../../Helpers/helperfunctions";
import Annoucements from "./Announcements";
import Greetings from "./Greetings";

const emptyAnalytics = {
  summary: { approved: 0, pending: 0, inProgress: 0, rejected: 0, all: 0 },
  pendingForYou: [],
  nearingReminder: [],
  workflowSummary: [],
  retuned_to_you: [],
};

const buildStatuses = (summary, intiator) => [
  ...(!intiator
    ? [
        {
          title: "Awaiting For Your Approval",
          value: summary.pending,
          description: "Awaiting your action",
          status: "pending",
          // trend: "up",
        },
      ]
    : [
        {
          title: "Returned to You",
          value: summary?.returned_to_you?.length,
          description: "Awaiting your action",
          status: "pending",
          // trend: "down",
        },
      ]),
  {
    title: "In Progress",
    value: summary.inProgress,
    description: "Currently processing",
    status: "inProgress",
    trend: "down",
  },
  {
    title: "Approved",
    value: summary.total_approved,
    description: "Total approved",
    status: "approved",
    // trend: "down",
  },
  {
    title: "Rejected",
    value: summary.total_rejected,
    description: "Total rejected",
    status: "rejected",
    // trend: "neutral",
  },
  {
    title: "All Statements",
    value: summary.all,
    description: "Total statements",
    status: "all",
    // trend: "neutral",
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
  const initiator =
    initiatorRoles.some((r) => userInfo.role.includes(r)) ||
    userInfo.role.every((role) => role === "initfn");
  const statuses = buildStatuses(analyticsData.summary, initiator);
  const userName = userInfo.email.split("@")[0];

  return (
    <main className="min-w-0 min-h-0 flex-1 overflow-x-hidden bg-gradient-to-br from-muted/50 via-background to-muted/20 px-3 py-4 sm:px-5 lg:h-full lg:px-6 lg:py-3">
      <div className="mx-auto min-w-0 max-w-[2000px] space-y-3">
        <div className="space-y-1">
          <div className="flex  justify-between gap-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Analytics dashboard
              </h1>
              <span className="rounded-2xs border border-border/70 bg-card/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-xs">
                Operations overview
              </span>
            </div>

            <div className="flex max-w-md flex-col items-start gap-1 text-right">
              <Greetings userName={userName} />
            </div>
          </div>
        </div>
        {isError && <DashboardError onRetry={refetch} />}
        <StatusSummary statuses={statuses} loading={isLoading} />
        <section
          className="grid grid-cols-2  gap-3 lg:grid-cols-1 xl:grid-cols-12 "
          aria-label="Work requiring attention"
        >
          <div className="min-w-0  xl:col-span-5">
            <PendingForYou
              items={analyticsData.pendingForYou}
              pending_count={analyticsData.summary.pending}
            />
          </div>
          <div className="min-w-0 xl:col-span-4">
            <QuickAccess />
          </div>
          <div className="min-w-0  xl:col-span-3">
            <Annoucements userInfo={userInfo} />
          </div>
        </section>
        <section
          className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-12"
          aria-label="Workflow analysis"
        >
          <div className="min-w-0 xl:col-span-4">
            <WorkflowSummary
              data={analyticsData.workflowSummary}
              loading={isLoading}
            />
          </div>
          <div className="min-w-0 xl:col-span-5">
            <NearingReminder
              items={analyticsData.nearingReminder}
              escalated_times={analyticsData.summary.escalated_times}
            />
          </div>
          <div className="min-w-0 xl:col-span-3">
            <DashboardPlaceholder
              title="Coming Soon"
              description="Average Turn Around Time for each category/dept. will appear here in upcoming release."
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
