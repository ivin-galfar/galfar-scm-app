import { usenewfn } from "../store/helperStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { fetchProjectDetails } from "../APIs/api";
import { useLocation } from "react-router-dom";
import { usePagination } from "../store/statementStore";
import { is_gm, is_hod } from "../Helpers/dept_helper";
import { getFeedType } from "../Helpers/helperfunctions";
import { FaRegTimesCircle } from "react-icons/fa";
import { CategoryForUi } from "../Helpers/category_helper";

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
  multiinit,
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
    userInfo?.role.includes("pd");
  const ishod = is_hod(userInfo?.role);

  const fwausers = userInfo.role.includes("initdc");
  const viewusers = userInfo.role.includes("view");
  const hireusers = userInfo.role.includes("inith");
  const isFileNotePage = location.pathname.startsWith("/filenote");
  const selectClassName = `${
    isFileNotePage
      ? "h-10 rounded-lg border-gray-300"
      : "h-8 rounded-md border-slate-300"
  } w-full appearance-none border bg-white bg-no-repeat px-2.5 pr-8 text-sm text-slate-800 transition hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:w-44 lg:w-40`;
  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%2364758B' d='M6 8.5 1.5 4h9z'/%3E%3C/svg%3E")`,
    backgroundPosition: "right 0.65rem center",
  };

  return (
    <div>
      {
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold text-slate-500">
            Filters
          </span>
          <div className="min-w-0 flex-1 sm:flex-none">
            <select
              aria-label="Type (required)"
              disabled={isDocLoading}
              value={type}
              onChange={(e) => {
                settype(e.target.value);
                setCategory("");
              }}
              className={selectClassName}
              style={selectStyle}
            >
              <option value="">Select type</option>
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
          <div className="min-w-0 flex-1 sm:flex-none">
            <select
              aria-label="Category (required)"
              disabled={isDocLoading || !type}
              value={category}
              onChange={(e) => handleDocumentcategorytype(e.target.value)}
              className={selectClassName}
              style={selectStyle}
            >
              <option value="">Select category</option>
              {categories?.map((category) => (
                <option key={category} value={category}>
                  {category !== "FWA" ? CategoryForUi[category] : "HWA"}
                </option>
              ))}
            </select>
          </div>
          {(demobusers || fwausers || isgm || hireusers || ishod) &&
            (category == "FWA" || category == "Demob") &&
            !multiinit && (
              <div className="min-w-0 flex-1 sm:flex-none">
                <select
                  aria-label="Project (required)"
                  disabled={isDocLoading}
                  value={selectedproject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className={selectClassName}
                  style={selectStyle}
                >
                  <option value="">Select project</option>
                  {projectcodes?.map((project) => (
                    <option key={project}>{project}</option>
                  ))}
                </select>
              </div>
            )}
          {type != "" && location.pathname == "/dashboardfn" && (
            <button
              type="button"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/10"
              aria-label="Clear filters"
              title="Clear filters"
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
              <FaRegTimesCircle size={17} />
            </button>
          )}
        </div>
      }
    </div>
  );
};

export default TypeFilter;
