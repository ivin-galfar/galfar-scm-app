/* eslint-disable react/prop-types */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui";
import WorkflowChart from "./WorkflowChart";

const WorkflowSummary = ({ data }) => (
  <Card className="h-full min-w-0 shadow-sm">
    <CardHeader>
      <CardTitle>Workflow Summary</CardTitle>
      <CardDescription>
        Current distribution across all requests
      </CardDescription>
    </CardHeader>
    <CardContent>
      <WorkflowChart data={data} />
    </CardContent>
  </Card>
);
export default WorkflowSummary;
