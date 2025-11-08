import { useContext, useEffect } from "react";
import galfarlogo from "../assets/Images/banner_2.jpg";
import { AppContext } from "./Context";
import fetchStatments from "../APIs/StatementsApi";
import useUserInfo from "../CustomHooks/useUserInfo";
import { Link } from "react-router-dom";
import { MdOutlinePendingActions } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import {
  FaBell,
  FaBuilding,
  FaTruck,
  FaUsers,
  FaWarehouse,
} from "react-icons/fa";
import { GrDocumentStore } from "react-icons/gr";
import { SiQuicktime } from "react-icons/si";
import { IoDocumentText, IoWarningOutline } from "react-icons/io5";
import fetchParticulars from "../APIs/ParticularsApi";
import { LuFactory } from "react-icons/lu";
import { useSelectedDept } from "../store/userStore";
import { is_logistics, is_plant } from "../Helpers/dept_helper";
import PlantHome from "./PlantHome";
import LogisticsHome from "./LogisticsHome";
import { useDashboardType } from "../store/logisticsStore";

const Home = () => {
  // const {
  //   setReceipts,
  //   receipts,
  //   setMrno,
  //   setAllReceipts,
  //   allreceipts,
  //   setStatusFilter,
  //   setMultiStatusFilter,
  //   particulars,
  //   setNewMr,
  //   setParticulars,
  //   setParticularName,
  //   setfreezeQuantity,
  // } = useContext(AppContext);
  // const userInfo = useUserInfo();
  // const statusMapping = {
  //   inita: [
  //     "Pending for HOD",
  //     "Pending for GM",
  //     "Pending for CEO",
  //     "Approved",
  //     "Rejected",
  //     "",
  //   ],
  //   Inith: [
  //     "Pending for HOD",
  //     "Pending for GM",
  //     "Pending for CEO",
  //     "Approved",
  //     "Rejected",
  //     "",
  //   ],
  //   hod: [
  //     "Pending for HOD",
  //     "Pending for GM",
  //     "Pending for CEO",
  //     "Rejected",
  //     "Approved",
  //   ],
  //   gm: [
  //     "Pending for GM",
  //     "Pending for HOD",
  //     "Pending for CEO",
  //     "Approved",
  //     "Rejected",
  //   ],
  //   ceo: [
  //     "Pending for GM",
  //     "Pending for HOD",
  //     "Pending for CEO",
  //     "Approved",
  //     "Rejected",
  //   ],
  // };
  // useEffect(() => {
  //   const loadParticulars = async () => {
  //     try {
  //       const particulars = await fetchParticulars(
  //         userInfo,
  //         userInfo?.dept_code?.[0]
  //       );
  //       setParticulars(particulars.Particulars);
  //       setfreezeQuantity(false);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   loadParticulars();
  // }, []);
  // const expectedStatuses = (statusMapping[userInfo?.role] || []).map((s) =>
  //   s.toLowerCase()
  // );
  // const pendingStatuses = !userInfo?.is_admin
  //   ? expectedStatuses.filter(
  //       (s) =>
  //         s.startsWith("pending") && s.includes(userInfo?.role.toLowerCase())
  //     )
  //   : expectedStatuses.filter((s) => s.startsWith("pending"));

  // useEffect(() => {
  //   const fetchStatementsdetails = async () => {
  //     try {
  //       const { filteredReceipts, categorizedReceipts, mrValues } =
  //         await fetchStatments({
  //           expectedStatuses,
  //           userInfo,
  //         });

  //       setAllReceipts(filteredReceipts);
  //       setReceipts(categorizedReceipts);
  //       setMrno(mrValues);
  //     } catch (error) {
  //       const message = error?.response?.data?.message || error.message;
  //       console.error("Fetch receipts error:", message);
  //     }
  //   };
  //   fetchStatementsdetails();
  // }, []);

  // const approvedReceipts = allreceipts?.filter(
  //   (r) => r?.formData?.status == "Approved"
  // );
  // const rejectedReceipts = allreceipts?.filter(
  //   (r) => r?.formData?.status == "Rejected"
  // );
  // const pendingReceipts = !userInfo?.is_admin
  //   ? allreceipts?.filter(
  //       (r) =>
  //         r?.formData?.status?.toLowerCase().startsWith("pending") &&
  //         r?.formData?.status
  //           ?.toLowerCase()
  //           .includes(userInfo?.role.toLowerCase())
  //     )
  //   : allreceipts?.filter((r) =>
  //       r?.formData?.status?.toLowerCase().startsWith("pending")
  //     );

  // const reviewReceipts = allreceipts?.filter(
  //   (r) => r?.formData?.status == "review"
  // );

  // const today = new Date();

  // const sevenDaysAgo = new Date();
  // sevenDaysAgo.setDate(today.getDate() - 7);

  // const recentReceipts = receipts.filter((r) => {
  //   const created = new Date(r.formData?.created_at);
  //   return created >= sevenDaysAgo;
  // });
  const userInfo = useUserInfo();

  const { selectedDept, setSelectedDept } = useSelectedDept();
  const { setDashboardType } = useDashboardType();

  const isLogistics = is_logistics(userInfo?.dept_code);

  const isPlant = is_plant(userInfo?.dept_code);
  const departments = [
    { key: "plant", name: "Plant & Equipment", icon: <LuFactory size={18} /> },
    { key: "logistics", name: "Logistics", icon: <FaTruck size={18} /> },
  ];
  useEffect(() => {
    if (isLogistics || isPlant) {
      setSelectedDept(isPlant ? departments[0].key : departments[1].key);
      setDashboardType(isPlant ? departments[0].key : departments[1].key);
    }
  }, []);

  const activeDeptKey = isPlant ? "plant" : isLogistics ? "logistics" : null;

  const orderedDepartments = activeDeptKey
    ? [
        ...departments.filter((d) => d.key === activeDeptKey),
        ...departments.filter((d) => d.key !== activeDeptKey),
      ]
    : departments;
  const isDeptDisabled = (deptKey) => {
    const alloweddept = [];
    if (isLogistics) alloweddept.push("logistics");
    if (isPlant) alloweddept.push("plant");
    return !alloweddept.includes(deptKey);
  };

  return (
    <div className="flex flex-col  min-h-screen relative">
      <img
        src={galfarlogo || ""}
        alt="Galfar Logo"
        className="w-full object-cover h-7 md:h-9 lg:h-[25rem]"
      />
      <div className="flex flex-wrap items-center gap-3 ml-10 mt-5">
        {orderedDepartments.map((dept) => (
          <div key={dept.key} className="relative group inline-block">
            <button
              key={dept.key}
              disabled={isDeptDisabled(dept.key)}
              onClick={() => {
                setSelectedDept(dept.key);
                setDashboardType(dept.key);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-md border font-medium text-sm transition-all duration-200 
        ${
          isDeptDisabled(dept.key)
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-auto"
            : selectedDept === dept.key
              ? "bg-blue-600 text-white border-blue-600 shadow-inner cursor-pointer"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
        }`}
            >
              {dept.icon}
              <span>{dept.name}</span>
            </button>
            {isDeptDisabled(dept.key) && (
              <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                You do not have access to this department
              </span>
            )}
          </div>
        ))}
      </div>

      <div className=" flex-grow gap-6 ml-10 ">
        {isPlant && selectedDept === "plant" && <PlantHome />}
        {isLogistics && selectedDept === "logistics" && <LogisticsHome />}

        {/* <div className="w-1/3 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between">
            <h2 className="flex text-lg font-semibold mb-4  gap-2 items-center">
              <SiQuicktime />
              Quick Links
            </h2>
            <Link
              to="/dashboard"
              className="relative inline-flex ml-auto cursor-pointer"
              onClick={() => {
                if (userInfo?.is_admin) {
                  setStatusFilter("review");
                  setMultiStatusFilter([]);
                } else {
                  setStatusFilter("");
                  setMultiStatusFilter(pendingStatuses);
                }
              }}
            >
              <FaBell size={22} className="text-gray-700" />
              {(userInfo?.is_admin
                ? reviewReceipts?.length > 0
                : pendingReceipts.length > 0) && (
                <span
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold 
             rounded-full w-4 h-4 flex items-center justify-center shadow-md animate-pulse-highlight"
                >
                  {!userInfo.is_admin
                    ? pendingReceipts.length
                    : reviewReceipts?.length}
                </span>
              )}
            </Link>
          </div>
          <ul className="p-2 space-y-3 ">
            {userInfo?.is_admin ? (
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
                    <p>{reviewReceipts?.length}</p>
                  </button>
                </Link>
              </li>
            ) : (
              ""
            )}
            <li>
              <Link to="/dashboard">
                <button
                  className="w-full flex text-left px-3 py-2 justify-between bg-blue-200 hover:bg-blue-300 rounded font-medium cursor-pointer"
                  onClick={() => {
                    setStatusFilter("");
                    setMultiStatusFilter(pendingStatuses);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <MdOutlinePendingActions />
                    <span>Pending Statements</span>
                  </div>
                  <p>{pendingReceipts?.length}</p>
                </button>
              </Link>
            </li>
            <li>
              <Link to="/dashboard">
                <button
                  className="w-full text-left px-3 py-2 justify-between flex bg-green-200 hover:bg-green-300 rounded font-medium cursor-pointer"
                  onClick={() => {
                    setStatusFilter("Approved");
                    setMultiStatusFilter([]);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <TiTick />
                    Approved Statements
                  </div>
                  <p>{approvedReceipts?.length}</p>
                </button>
              </Link>
            </li>
            <li>
              <Link to="/dashboard">
                <button
                  className="w-full text-left px-3 py-2 justify-between flex bg-red-200 hover:bg-red-300 rounded font-medium cursor-pointer"
                  onClick={() => {
                    setStatusFilter("Rejected");
                    setMultiStatusFilter([]);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <ImCross />
                    Rejected Statements
                  </div>
                  <p>{rejectedReceipts?.length}</p>
                </button>
              </Link>
            </li>
            <li>
              <Link to="/dashboard">
                <button
                  className="w-full text-left px-3 py-2 bg-gray-100 justify-between flex hover:bg-gray-200 rounded font-medium cursor-pointer"
                  onClick={() => {
                    setStatusFilter("All");
                    setMultiStatusFilter([]);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <GrDocumentStore />
                    All Statements
                  </div>
                  <p>{receipts?.length}</p>
                </button>
              </Link>
            </li>
          </ul>
        </div>
        <div className="w-1/3 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg  font-semibold mb-4 flex gap-2 items-center">
            {" "}
            <IoDocumentText />
            <div className="flex justify-between items-center w-full">
              <h2 className="text-base font-medium text-gray-700">
                Recent Statements
              </h2>
              {userInfo?.is_admin ? (
                <Link to="/receipts">
                  <button
                    className="border border-blue-500 text-blue-500 hover:bg-blue-50 text-sm px-3 py-1.5 rounded cursor-pointer"
                    onClick={() => {
                      (setNewMr(true),
                        setParticularName(particulars[0]?.id),
                        setNewMr(true));
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
            {recentReceipts.length > 0 ? (
              recentReceipts.map((r, index) => (
                <div
                  key={r.id || index}
                  className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start"
                >
                  <div className="flex flex-col">
                    <p className="font-medium text-gray-900">
                      {r.formData.hiringname}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(r.formData.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      r.formData.status
                        ? r.formData.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : r.formData.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        : ""
                    }`}
                  >
                    {r.formData.status || "--"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No recent receipts</p>
            )}
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default Home;
