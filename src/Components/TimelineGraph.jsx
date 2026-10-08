import { GoDotFill } from "react-icons/go";

const TimelineGraph = () => {
  return (
    <div className="sticky right-0 top-2 z-20 flex shrink-0 self-start flex-col gap-2 rounded-lg bg-slate-50 px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <GoDotFill className="text-green-600" />
        <span>Approved</span>
      </div>
      <div className="flex items-center gap-2">
        <GoDotFill className="text-orange-600" />
        <span>Pending</span>
      </div>
      <div className="flex items-center gap-2">
        <GoDotFill className="text-red-600" />
        <span>Rejected</span>
      </div>
      <div className="flex items-center gap-2">
        <GoDotFill className="text-blue-500" />
        <span>In Queue</span>
      </div>
    </div>
  );
};

export default TimelineGraph;
