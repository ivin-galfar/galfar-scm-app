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
  is_fm,
  is_gm,
  is_hod,
  is_logistics,
  is_plant,
} from "../Helpers/dept_helper";
import PlantHome from "./PlantHome";
import LogisticsHome from "./LogisticsHome";
import { useDashboardType } from "../store/logisticsStore";
import { getDeptConfig } from "../Helpers/Permissions";
import HomeContainer from "./HomeContainer";

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
  const isPlant = is_plant(userInfo?.dept_code);
  const departments = [
    { key: "plant", name: "Hiring / Asset", icon: <LuFactory size={18} /> },
    { key: "bvrplant", name: "Buy vs Rent", icon: <GiClamp size={18} /> },
    { key: "logistics", name: "Logistics", icon: <FaTruck size={18} /> },
  ];

  const { defaultDept, activeDept, allowedDept } = getDeptConfig({
    isLogistics,
    isPlant,
    isfm,
    isasset,
    ishod,
    isceo,
    isgm,
  });

  useEffect(() => {
    if (!userInfo) return;
    setSelectedDept(defaultDept);
    setDashboardType(defaultDept);
  }, [userInfo, isLogistics, isfm, isPlant]);

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
        {(isasset || isfm || ishod || isceo || isgm) &&
          selectedDept === "bvrplant" && <HomeContainer />}
      </div>
    </div>
  );
};

export default Home;
