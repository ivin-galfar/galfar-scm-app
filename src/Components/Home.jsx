import { useEffect } from "react";
import galfarlogo from "../assets/Images/banner_2.jpg";
import useUserInfo from "../CustomHooks/useUserInfo";
import { FaTruck } from "react-icons/fa";
import { GiClamp } from "react-icons/gi";
import { LuFactory } from "react-icons/lu";
import { useSelectedDept } from "../store/userStore";
import {
  is_asset,
  is_ceo,
  is_cm,
  is_fm,
  is_fnote,
  is_gm,
  is_hod,
  is_logistics,
  is_plant,
  is_pm,
} from "../Helpers/dept_helper";
import PlantHome from "./PlantHome";
import LogisticsHome from "./LogisticsHome";
import { useDashboardType } from "../store/logisticsStore";
import { getDeptConfig } from "../Helpers/Permissions";
import HomeContainer from "./HomeContainer";
import { IoDocument } from "react-icons/io5";
import FnHomeContainer from "./FnHomeContainer";

const Home = () => {
  const userInfo = useUserInfo();

  const { selectedDept, setSelectedDept } = useSelectedDept();
  const { setDashboardType } = useDashboardType();

  const isLogistics = is_logistics(userInfo?.dept_code);
  const isasset = is_asset(userInfo?.role);
  const isfm = is_fm(userInfo?.role);
  const ishod = is_hod(userInfo?.role);
  const isgm = is_gm(userInfo?.role);
  const isceo = is_ceo(userInfo?.role);
  const ispm = is_pm(userInfo?.role);
  const iscm = is_cm(userInfo?.role);

  const isPlant = is_plant(userInfo?.dept_code);
  const isfnote = is_fnote(userInfo?.role);

  const departments = [
    {
      key: "plant",
      name: "Hiring / Asset",
      icon: <LuFactory size={18} />,
      color: " bg-blue-600",
    },
    {
      key: "bvrplant",
      name: "Buy vs Rent",
      icon: <GiClamp size={18} />,
      color: "bg-emerald-600",
    },
    {
      key: "logistics",
      name: "Logistics",
      icon: <FaTruck size={18} />,
      color: "bg-indigo-600",
    },
    {
      key: "fn",
      name: "FN / IOC",
      icon: <IoDocument size={18} />,
      color: "bg-purple-600",
    },
  ];

  const { defaultDept, activeDept, allowedDept } = getDeptConfig({
    isLogistics,
    isPlant,
    isfm,
    isasset,
    ishod,
    isceo,
    isgm,
    isfnote,
    ispm,
    iscm,
  });

  useEffect(() => {
    if (!userInfo) return;
    setSelectedDept(defaultDept);
    setDashboardType(defaultDept);
  }, [userInfo, isLogistics, isfm, isPlant, isfnote]);

  const orderedDepartments = activeDept
    ? [
        ...departments.filter((d) => d.key === activeDept),
        ...departments.filter(
          (d) => d.key !== activeDept && allowedDept.includes(d.key),
        ),
        ...departments.filter(
          (d) => d.key !== activeDept && !allowedDept.includes(d.key),
        ),
      ]
    : departments;
  const isDeptDisabled = (deptKey) => !allowedDept?.includes(deptKey);

  return (
    <div className="flex flex-col pb-10 min-h-screen relative ">
      <img
        src={galfarlogo || ""}
        alt="Galfar Logo"
        className="w-full object-cover  md:h-[40vh]"
      />
      <div className="ml-10 mt-5  border-gray-300 flex">
        {orderedDepartments.map((dept) => (
          <div key={dept.key} className="relative group inline-block">
            <button
              key={dept.key}
              disabled={isDeptDisabled(dept.key)}
              onClick={() => {
                setSelectedDept(dept.key);
                setDashboardType(dept.key);
              }}
              className={`px-6 py-2 text-sm font-medium flex items-center gap-2 border-b-4  transition-all duration-200 
        ${
          isDeptDisabled(dept.key)
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-auto"
            : selectedDept === dept.key
              ? `text-white  ${dept.color} border-t border-l border-r border-gray-100 rounded-t-md cursor-pointer `
              : " text-gray-600  hover:bg-gray-50 hover:border-indigo-300 cursor-pointer border-b-gray-200"
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

      <div className="bg-white border-white rounded-b-md pl-10 mt-0 shadow">
        {isPlant && selectedDept === "plant" && <PlantHome />}
        {isLogistics && selectedDept === "logistics" && <LogisticsHome />}
        {(isasset || isfm || ishod || isceo || isgm) &&
          selectedDept === "bvrplant" && <HomeContainer />}
        {isfnote && selectedDept === "fn" && <FnHomeContainer />}
      </div>
    </div>
  );
};

export default Home;
