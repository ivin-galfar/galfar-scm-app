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
      </div>
    </div>
  );
};

export default Home;
