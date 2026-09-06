/* eslint-disable react/prop-types */
import StatusCard from "./StatusCard";

const StatusSummary = ({ statuses, loading }) => (
  <section aria-labelledby="status-summary-heading">
    <h2 id="status-summary-heading" className="sr-only">
      Workflow status summary
    </h2>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statuses.map((status) => (
        <StatusCard key={status.status} {...status} loading={loading} />
      ))}
    </div>
  </section>
);

export default StatusSummary;
