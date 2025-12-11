import { use, useEffect, useState } from "react";
import { fetchallid } from "../APIs/api";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useHistoryData, useIdHistory } from "../store/logisticsStore";
import ApproverTimeline from "./ApproverTimeline";
import TimelineGraph from "./TimelineGraph";

const ApprovalHistory = () => {
  const [allids, setAllids] = useState(null);
  const userInfo = useUserInfo();
  const { selectedId, setSelectedId } = useIdHistory();
  const { approverhistory } = useHistoryData();
  const fetchallids = async () => {
    const ids = await fetchallid(userInfo);
    setAllids(ids);
  };

  useEffect(() => {
    fetchallids();
  }, []);

  return (
    <div className="flex">
      <div className="flex  items-start ">
        <div className="flex items-center gap-5">
          <div className="text-sm font-medium text-gray-700 text-nowrap justify-center">
            Select CS NO:
          </div>
          <div className="text-sm font-medium text-gray-700">
            <select
              className="block w-full px-2 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white overflow-hidden"
              onChange={(e) => setSelectedId(e.target.value)}
              value={selectedId || approverhistory?.id || "default"}
            >
              <option value="default">-Select cs-</option>
              {allids?.map((allid) => (
                <option key={allid.id} value={allid.id}>
                  {allid.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center pt-10 gap-20">
        <ApproverTimeline approverhistory={approverhistory} />
        <TimelineGraph />
      </div>
    </div>
  );
};

export default ApprovalHistory;
