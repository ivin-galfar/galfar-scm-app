import { usenewfn } from "../store/helperStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { BsAsterisk } from "react-icons/bs";
import { fetchProjectDetails } from "../APIs/api";
import { useLocation } from "react-router-dom";
import { usePagination } from "../store/statementStore";
import { is_gm } from "../Helpers/dept_helper";
import { getFeedType } from "../Helpers/helperfunctions";
import { CiCircleRemove } from "react-icons/ci";

const TypeFilter = ({
  isDocLoading,
  type,
  settype,
  category,
  setCategory,
  setProjectCodes,
  projectcodes,
  categories,
  selectedproject,
  setSelectedProject,
  setSearch,
  setSearchCSNo,
  setSearchCSName,
  types,
}) => {
  const userInfo = useUserInfo();
  const { setPageIndex } = usePagination();
  const location = useLocation();
  const isgm = is_gm(userInfo.role);
  const handleDocumentcategorytype = async (category) => {
    setPageIndex(0);
    if (category == "Demob" || category == "FWA") {
      const projects = await fetchProjectDetails(userInfo);
      const projectids = projects.map((pr) => pr.project);

      const allocatedprcodes = userInfo.pr_code;
      const matchedprcodes =
        userInfo.role.includes("gm") || userInfo?.role.includes("hod")
          ? projectids
          : projectids.filter((project) => allocatedprcodes?.includes(project));

      setProjectCodes(matchedprcodes);
    } else {
      setProjectCodes([]);
    }
    setCategory(category);
  };
  const demobusers =
    userInfo?.role.includes("initpr") ||
    userInfo?.role.includes("cm") ||
    userInfo?.role.includes("view") ||
    userInfo?.role.includes("pm") ||
    userInfo?.role.includes("hod");

  const fwausers = userInfo.role.includes("initdc");
  const viewusers = userInfo.role.includes("view");
  const hireusers = userInfo.role.includes("inith");

  return (
    <div>
      {
        <div className="flex justify-center items-center  rounded-md mb-1">
          <div className="px-4">
            <label className="text-gray-500 font-medium text-small flex gap-2">
              Type : <BsAsterisk size={6} color="red" className="mt-2" />{" "}
            </label>
            <select
              disabled={isDocLoading}
              value={type}
              onChange={(e) => {
                settype(e.target.value);
                setCategory("");
              }}
              className="w-48 md:w-56 lg:w-40 appearance-none rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-no-repeat bg-right pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.9rem center",
              }}
            >
              <option value="">📋 - Select Type -</option>
              {types?.map((type) => {
                if (
                  type === "file_note" &&
                  (demobusers || fwausers || viewusers)
                ) {
                  return null;
                }

                return (
                  <option key={type} value={type}>
                    {getFeedType(type)}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="px-4">
            <label className="text-gray-500 font-medium text-small flex gap-2">
              Category:{" "}
              <BsAsterisk size={6} color="red" className="mt-2" />{" "}
            </label>
            <select
              disabled={isDocLoading}
              value={category}
              onChange={(e) => handleDocumentcategorytype(e.target.value)}
              className="w-48 md:w-56 lg:w-48 appearance-none rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-no-repeat bg-right pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.9rem center",
              }}
            >
              <option value="">📋 - Select Category - </option>
              {categories?.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
          {(demobusers || fwausers || isgm || hireusers) &&
            (category == "FWA" || category == "Demob") && (
              <div className="px-4">
                <label className="text-gray-500 font-medium text-small flex gap-2">
                  Project:{" "}
                  <BsAsterisk size={6} color="red" className="mt-2" />{" "}
                </label>
                <select
                  disabled={isDocLoading}
                  value={selectedproject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-48 md:w-56 lg:w-45 appearance-none rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 0.9rem center",
                  }}
                >
                  <option value="">📋 - Select - </option>
                  {projectcodes?.map((project) => (
                    <option key={project}>{project}</option>
                  ))}
                </select>
              </div>
            )}
          {type != "" && location.pathname == "/dashboardfn" && (
            <span
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer transition-colors mt-5"
              onClick={() => {
                settype("");
                setCategory("");
                sessionStorage.removeItem("filenoteFilters");
                setSelectedProject("");
                setProjectCodes([]);
                setPageIndex(0);
                setSearch({
                  isText: true,
                  isNumber: false,
                  value: "",
                });
                setSearchCSNo("");
                setSearchCSName("");
              }}
            >
              <CiCircleRemove color="red" size={20} />
            </span>
          )}
        </div>
      }
    </div>
  );
};

export default TypeFilter;
