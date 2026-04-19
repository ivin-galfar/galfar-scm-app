import { usenewfn } from "../store/helperStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { BsAsterisk } from "react-icons/bs";
import { fetchProjectDetails } from "../APIs/api";
import { useLocation } from "react-router-dom";

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

  const handleDocumentcategorytype = async (category) => {
    if (category == "Demob") {
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

  const demobusers =
    userInfo?.role.includes("initpr") ||
    userInfo?.role.includes("cm") ||
    userInfo?.role.includes("pm");

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
            {!demobusers && <option value="file_note">File Note</option>}

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
          {demobusers && (
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
        </div>
      }
    </div>
  );
};

export default TypeFilter;
