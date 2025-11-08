import { useQuery } from "@tanstack/react-query";
import { fetchallid } from "../APIs/api";
import useUserInfo from "../CustomHooks/useUserInfo";
import { SiQuicktime } from "react-icons/si";
import { GrDocumentStore } from "react-icons/gr";
import { Link, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { MdOutlinePendingActions } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { RxCross1 } from "react-icons/rx";
import {
  usecolumns,
  useNewStatement,
  useParticularValues,
  useStatement,
  useStatusFilter,
} from "../store/logisticsStore";

const LogisticsHome = () => {
  const userInfo = useUserInfo();
  const { resetcolumns } = usecolumns();
  const { resetData } = useStatement();
  const { setNewStatement } = useNewStatement();
  const { resetparticularvalue } = useParticularValues();
  const navigate = useNavigate();

  const { data: cs_id } = useQuery({
    queryKey: ["csid"],
    queryFn: () => fetchallid(userInfo),
    enabled: !!userInfo,
  });
  const pendingstatements = cs_id?.filter((item) => {
    if (userInfo.is_admin) {
      return item.status?.includes("pending");
    } else {
      return item.status?.includes(userInfo?.role?.toLocaleLowerCase());
    }
  });
  const approvedstatements =
    cs_id?.filter((item) => item.status?.includes("approved")) || [];

  const rejectedstatements =
    cs_id?.filter((item) => item.status?.includes("rejected")) || [];

  const today = new Date();
  const { setStatusFilter } = useStatusFilter();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const recentReceipts = cs_id?.filter((r) => {
    const created = new Date(r?.created_at);
    return created >= sevenDaysAgo;
  });

  return (
    <div className="flex gap-6 mt-5">
      <div className="w-1/3 p-4 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between">
          <h2 className="flex text-lg font-semibold mb-4  gap-2 items-center">
            <SiQuicktime />
            Quick Links
          </h2>
          <Link
            to="/dashboard"
            className="relative inline-flex ml-auto cursor-pointer"
          >
            <FaBell size={22} className="text-gray-700" />
            {pendingstatements?.length > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold 
             rounded-full w-4 h-4 flex items-center justify-center shadow-md animate-pulse-highlight"
              >
                {pendingstatements.length}
              </span>
            )}
          </Link>
        </div>
        <ul className="p-2 space-y-3 ">
          {/* {userInfo?.is_admin ? (
            <li>
              <Link to="/dashboard">
                <button
                  className="w-full flex text-left px-3 py-2 justify-between bg-cyan-300 hover:bg-cyan-400 rounded font-medium cursor-pointer"
                  onClick={() => {
                    setStatusFilter("review");
                    setMultiStatusFilter([]);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <IoWarningOutline size={18} />
                    <span>Under Review</span>
                  </div>
                  <p>{reviewstatements?.length}</p>
                </button>
              </Link>
            </li>
          ) : (
            ""
          )} */}
          <li>
            <Link to="/dashboardlg">
              <button
                className="w-full flex text-left px-3 py-2 justify-between bg-blue-200 hover:bg-blue-300 rounded font-medium cursor-pointer"
                onClick={() => {
                  setStatusFilter("Pending");
                }}
              >
                <div className="flex items-center gap-4">
                  <MdOutlinePendingActions />
                  <span>Pending Statements</span>
                </div>
                <p>{pendingstatements?.length}</p>
              </button>
            </Link>
          </li>
          <li>
            <Link to="/dashboardlg">
              <button
                className="w-full text-left px-3 py-2 justify-between flex bg-green-200 hover:bg-green-300 rounded font-medium cursor-pointer"
                onClick={() => {
                  setStatusFilter("Approved");
                }}
              >
                <div className="flex items-center gap-4">
                  <TiTick />
                  Approved Statements
                </div>
                <p>{approvedstatements?.length}</p>
              </button>
            </Link>
          </li>
          <li>
            <Link to="/dashboardlg">
              <button
                className="w-full text-left px-3 py-2 justify-between flex bg-red-200 hover:bg-red-300 rounded font-medium cursor-pointer"
                onClick={() => {
                  setStatusFilter("Rejected");
                }}
              >
                <div className="flex items-center gap-4">
                  <RxCross1 />
                  Rejected Statements
                </div>
                <p>{rejectedstatements?.length}</p>
              </button>
            </Link>
          </li>
          <li>
            <Link to="/dashboardlg">
              <button
                className="w-full text-left px-3 py-2 bg-gray-100 justify-between flex hover:bg-gray-200 rounded font-medium cursor-pointer"
                onClick={() => {
                  setStatusFilter("All");
                }}
              >
                <div className="flex items-center gap-4">
                  <GrDocumentStore />
                  All Statements
                </div>
                <p>{cs_id?.length}</p>
              </button>
            </Link>
          </li>
        </ul>
      </div>
      <div className="w-1/3 p-4 bg-white rounded-lg shadow-md border border-gray-200 ">
        <h2 className="text-lg  font-semibold mb-4 flex gap-2 items-center">
          {" "}
          <IoDocumentText />
          <div className="flex justify-between items-center w-full">
            <h2 className="text-base font-medium text-gray-700">
              Recent Statements
            </h2>
            {userInfo?.is_admin ? (
              <Link to="/lstatements">
                <button
                  className="border border-blue-500 text-blue-500 hover:bg-blue-50 text-sm px-3 py-1.5 rounded cursor-pointer"
                  onClick={() => {
                    resetcolumns();
                    resetData();
                    setNewStatement();
                    resetparticularvalue();

                    navigate(`/lstatements`, { replace: true });
                  }}
                >
                  <span className="flex justify-center items-center gap-1">
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    New Comparative Statement
                  </span>
                </button>
              </Link>
            ) : (
              ""
            )}
          </div>
        </h2>
        <ul className="space-y-3 max-h-64 overflow-y-auto text-gray-700">
          {recentReceipts?.length > 0 ? (
            recentReceipts.map((r, index) => (
              <div
                key={r.id || index}
                className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start"
              >
                <div className="flex flex-col">
                  <p className="font-medium text-gray-900">{r.cargo_details}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    r.status
                      ? r.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : r.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      : ""
                  }`}
                >
                  {r.status == "created"
                    ? "--"
                    : r.status
                        ?.split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ") || "--"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No recent receipts</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default LogisticsHome;
