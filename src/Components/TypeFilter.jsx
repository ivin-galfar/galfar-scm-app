import { usenewfn } from "../store/helperStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { BsAsterisk } from "react-icons/bs";
import { fetchProjectDetails } from "../APIs/api";
import { useLocation } from "react-router-dom";
import { usePagination } from "../store/statementStore";

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
}) => {
  const userInfo = useUserInfo();
  const { setPageIndex } = usePagination();
  console.log(type);

  const handleDocumentcategorytype = async (category) => {
    setPageIndex(0);
    if (category == "Demob" || category == "FWA") {
      const projects = await fetchProjectDetails(userInfo);
      const projectids = projects.map((pr) => pr.project);
      const allocatedprcodes = userInfo.pr_code;
      const matchedprcodes = projectids.filter((project) =>
        allocatedprcodes.includes(project),
      );
      setProjectCodes(matchedprcodes);
    } else {
      setProjectCodes([]);
    }
    setCategory(category);
  };
  const location = useLocation();
  const demobusers =
    userInfo?.role.includes("initpr") ||
    userInfo?.role.includes("cm") ||
    userInfo?.role.includes("pm");

  const fwausers = userInfo.role.includes("initdc");

  return (
    <div>
      {
        <div className="flex justify-center items-center gap-3 p-4 rounded-md">
          <label className="font-medium flex">
            Type: <BsAsterisk size={6} color="red" />{" "}
          </label>
          <select
            disabled={isDocLoading}
            value={type}
            onChange={(e) => {
              settype(e.target.value);
              setCategory("");
            }}
            className="w-50 appearance-none rounded-lg border-2 border-gray-300 px-5 py-2 text-sm font-medium 
                   text-gray-800 bg-white  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                   hover:border-blue-400 hover:shadow-lg transition-all duration-200
                   focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
                   bg-no-repeat bg-right pr-12"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundPosition: "right 0.9rem center",
            }}
          >
            <option value="">📋 - Select Type -</option>
            {!demobusers && !fwausers && (
              <option value="file_note">File Note</option>
            )}

            <option value="ioc">IOC</option>
          </select>
          <label className="font-medium flex">
            Category: <BsAsterisk size={6} color="red" />{" "}
          </label>
          <select
            disabled={isDocLoading}
            value={category}
            onChange={(e) => handleDocumentcategorytype(e.target.value)}
            className="w-60 appearance-none rounded-lg border-2 border-gray-300 px-5 py-2 text-sm font-medium
                   text-gray-800 bg-white  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                   hover:border-blue-400 hover:shadow-lg transition-all duration-200
                   focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
                   bg-no-repeat bg-right pr-12"
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
          {(demobusers || fwausers) && location.pathname != "/dashboardfn" && (
            <>
              <label className="font-medium flex">
                Project: <BsAsterisk size={6} color="red" />{" "}
              </label>
              <select
                disabled={isDocLoading}
                value={selectedproject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-40 appearance-none rounded-lg border-2 border-gray-300 px-5 py-2 text-sm font-medium h-
                        text-gray-800 bg-white  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                        hover:border-blue-400 hover:shadow-lg transition-all duration-200
                        focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
                        bg-no-repeat bg-right pr-12"
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
            </>
          )}
          {type != "" &&
            location.pathname ==
              "/dashboardfn" && (
                <span
                  className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                  onClick={() => {
                    settype("");
                    setCategory("");
                    setSelectedProject("");
                    setProjectCodes([]);
                    setPageIndex(0);
                  }}
                >
                  <span className="justify-center leading-none">&times;</span>
                  Clear filters
                </span>,
              )}
        </div>
      }
    </div>
  );
};

export default TypeFilter;
