import { GoDotFill } from "react-icons/go";

const TimelineGraph = () => {
  return (
    <div className="flex flex-col gap-2">
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
