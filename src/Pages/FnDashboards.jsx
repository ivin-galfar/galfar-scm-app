import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  useTable,
} from "@tanstack/react-table";
import {
  createExpandedRowModel,
  createPaginatedRowModel,
  rowExpandingFeature,
  rowPaginationFeature,
  tableFeatures,
} from "@tanstack/table-core";
import { deletefn, fetchfilenoteids, fetchfilenoteidvalue } from "../APIs/api";
import { Link, useLocation } from "react-router-dom";
import useuserInfo from "../CustomHooks/useUserInfo";
import { useStatusFilter } from "../store/logisticsStore";
import { is_plant } from "../Helpers/dept_helper";
import { usePagination } from "../store/statementStore";
import { useEffect, useRef, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { LuEye, LuFileDown, LuTrash2 } from "react-icons/lu";
import Alerts from "../Components/Alerts";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { SiTicktick } from "react-icons/si";
import { MdOutlineError } from "react-icons/md";
import { handleFnPrint } from "../Helpers/print_helper";
import { getDashboardStatusTabClass } from "../Helpers/dashboardStatusNav";
import DashboardStatusNav from "../Components/DashboardStatusNav";
import {
  formatDateDDMMYYYY,
  getlastSubmittedDate,
  getSubmittedDate,
  getType,
} from "../Helpers/helperfunctions";
import { BiBadgeCheck } from "react-icons/bi";
import {
  useCategories,
  useClickFromDashboard,
  useDeleteStore,
  usenewfn,
  useProjectCodes,
  useSelectedProject,
  useTypes,
} from "../store/helperStore";
import TypeFilter from "../Components/TypeFilter";
import { getcategory, getTypes } from "../Helpers/category_helper";
import { GrAttachment } from "react-icons/gr";
import InputSearch from "../Components/InputSearch";
import Loading from "../Components/Loading";
import { fetchProjectDetails } from "../APIs/api";
import {
  getProjectIocAccess,
  getProjectIocCategoryOptions,
} from "../Helpers/projectIocAccess";
import { getInitiatorCapabilities } from "../Helpers/initiatorCapabilities";
const FnDashboards = () => {
  const userInfo = useuserInfo();
  const location = useLocation();
  const isProjectsIocEntry =
    new URLSearchParams(location.search).get("view") === "projects-ioc";
  const requestedProjectIocCategory = new URLSearchParams(location.search).get(
    "category",
  );
  const projectIocAccess = getProjectIocAccess(userInfo);
  const initiatorCapabilities = getInitiatorCapabilities(userInfo?.role);
  const previousProjectsIocEntry = useRef(isProjectsIocEntry);
  const isAdmin = userInfo?.is_admin;
  const deleteStatement = useDeleteStore((state) => state.deleteStatement);
  const setDeleteStatement = useDeleteStore(
    (state) => state.setDeleteStatement,
  );
  const resetDeleteStatement = useDeleteStore(
    (state) => state.resetDeleteStatement,
  );

  const { errormessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { pagination, setPageIndex, setPageSize } = usePagination();
  const [searchcsno, setSearchCSNo] = useState(null);
  const [searchcsname, setSearchCSName] = useState(null);
  const [search, setSearch] = useState({
    isNumber: false,
    isText: true,
    value: null,
  });
  const queryClient = useQueryClient();
  const { setNewfn } = usenewfn();
  const [categoryFilter, setCategoryFilter] = useState(() => {
    const saved = sessionStorage.getItem("filenoteFilters");
    return saved ? JSON.parse(saved).categoryFilter || "" : "";
  });
  const [typeFilter, setTypeFilter] = useState(() => {
    const saved = sessionStorage.getItem("filenoteFilters");
    return saved ? JSON.parse(saved).typeFilter || "" : "";
  });
  const { setStatusFilter, statusfilter } = useStatusFilter();
  const { projectcodes, setProjectCodes } = useProjectCodes();
  // const [selectedproject, setSelectedProject] = useState([]);
  const { selectedproject, setSelectedProject } = useSelectedProject();
  // const [categories, setCategories] = useState([]);
  const { categories, setCategories } = useCategories();
  const { types, setTypes } = useTypes();
  const isgm = userInfo?.role.includes("gm");
  const [total, setTotal] = useState(0);
  const isplant = is_plant(userInfo?.dept_code);
  const demob_intimators =
    userInfo?.role?.includes("inith") || userInfo?.role.includes("hod");
  const { resetIsClicked } = useClickFromDashboard();
  const { data: fndata, isLoading } = useQuery({
    queryKey: [
      "fnid",
      statusfilter,
      pagination.pageSize,
      pagination.pageIndex,
      searchcsno,
      searchcsname,
      categoryFilter,
      typeFilter,
      selectedproject,
    ],
    queryFn: () =>
      fetchfilenoteids({
        userInfo,
        module: "/dashboardfn",
        dept_id: userInfo.dept_code,
        statusfilter,
        searchcsno,
        searchcsname,
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        categoryFilter,
        typeFilter,
        projectFilter: selectedproject,
      }),
    enabled: !!userInfo,
    placeholderData: (previousData) => previousData,
  });

  const handleSearch = (e) => {
    if (search.isNumber) {
      setSearchCSNo(e.target.value);
    } else {
      setSearchCSName(e.target.value);
    }
    setStatusFilter("All");
    setSearch((prev) => ({
      ...prev,
      type: search.isNumber ? search.isNumber : search.isText,
      value: e.target.value,
    }));
    setPageIndex(0);
  };

  const getstatement = async (fn_id) => {
    try {
      let response = await fetchfilenoteidvalue(fn_id, userInfo);
      return response;
    } catch (error) {
      const message = error?.response?.data.message || error.message;
      setShowToast();
      setErrorMessage(message);
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
      }, 1000);
    }
  };

  useEffect(() => {
    const fetchStatments = async () => {
      try {
        const totalcount = await fetchfilenoteids({
          userInfo,
          module: "/dashboardfn",
          dept_id: userInfo.dept_code,
          statusfilter,
          searchcsno,
          searchcsname,
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          count: true,
          categoryFilter,
          typeFilter,
          projectFilter: selectedproject,
        });
        setTotal(totalcount);
      } catch (error) {
        const message = error?.response?.data?.message || error.message;
        console.error("Fetch receipts error:", message);
      }
    };
    fetchStatments();
    resetIsClicked();
  }, [
    statusfilter,
    searchcsno,
    searchcsname,
    selectedproject,
    categoryFilter,
    typeFilter,
  ]);

  const handleDelete = async (id) => {
    try {
      await deletefn(id);
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
        resetDeleteStatement();
      }, 1000);
      queryClient.invalidateQueries({ queryKey: ["fnid"] });
    } catch (error) {
      const message = error?.response?.data.message || error.message;
      setShowToast();
      setErrorMessage(message);
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
      }, 1000);
    }
  };

  const columnHelper = createColumnHelper();
  const hasProjectColumn = fndata?.some((row) => row.project_code);
  // const hideDepartColumn = fndata?.some((row) => row.category !== "FWA");

  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      meta: {
        className: "w-14 min-w-14 max-w-14 whitespace-nowrap text-center !px-2",
      },
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor((row) => row?.doc_no, {
      id: "doc_id",
      meta: { className: "min-w-[120px] whitespace-pre-wrap break-words" },
      header: "Doc. No.",
      cell: (info) => {
        const type = info.row.original?.type == "ioc" ? "IOC" : "FN";
        const category = info.row.original?.category.toUpperCase();
        return `${type}/  ${category == "FWA" ? "HWA" : category} -  ${info.getValue() || ""}`;
      },
    }),
    columnHelper.accessor((row) => row?.name, {
      id: "subject",
      header: "Subject",
      meta: {
        className:
          "min-w-[160px] max-w-[220px] whitespace-pre-wrap break-words",
      },
      cell: (info) => info.getValue() || "-",
    }),

    ...(hasProjectColumn
      ? [
          columnHelper.accessor((row) => row?.project_code, {
            id: "project",
            header: "Project",
            cell: (info) => info.getValue() || "-",
          }),
        ]
      : []),

    columnHelper.accessor((row) => getType(row?.type), {
      id: "type",
      header: "Type",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.category, {
      id: "category",
      header: "Category",
      cell: (info) => {
        const value = info.getValue();
        return value === "FWA" ? "HWA" : value || "-";
      },
    }),
    // ...(hideDepartColumn
    //   ? [
    //       columnHelper.accessor(
    //         (row) => {
    //           const dept = dept_finder(row?.department_id);
    //           return dept === "Plant & Equipment" ? "P&E" : dept;
    //         },
    //         {
    //           id: "department",
    //           header: "Dept.",
    //           cell: (info) => info.getValue() || "-",
    //         },
    //       ),
    //     ]
    //   : []),

    columnHelper.accessor((row) => row?.status, {
      id: "status",
      header: "Status",
      meta: { className: "min-w-[180px] whitespace-pre-wrap break-words" },
      cell: (info) => {
        const status = info.getValue() || "";
        const formattedstatus = status
          .split(" ")
          .map((word, index) =>
            index == 2
              ? word.toUpperCase()
              : word.charAt(0).toUpperCase() +
                word.slice(1).toLocaleLowerCase(),
          )
          .join(" ");

        const rowData = info.row.original;
        const getStatusProgress = (row) => {
          if (row?.type === "file_note") {
            if (row?.category === "General" || row?.category === "TFW") {
              return {
                "Pending For HOD": 40,
                "Pending For GM": 60,
                "Pending For CEO": 80,
                Approved: 100,
                Rejected: 100,
              };
            } else {
              return {
                "Pending For HOD": 20,
                "Pending For SFM": 40,
                "Pending For GM": 60,
                "Pending For CEO": 80,
                Approved: 100,
                Rejected: 100,
              };
            }
          } else if (row?.type === "ioc") {
            if (row?.category === "FWA") {
              return {
                "Pending For CM": 35,
                "Pending For PM": 50,
                "Pending For PD": 60,
                "Pending For GM": 80,
                Approved: 100,
                Rejected: 100,
              };
            } else if (row?.category === "Insurance") {
              return {
                "Pending For HOD": 20,
                "Pending For SFM": 40,
                "Pending For GM": 60,
                "Pending For CEO": 80,
                Approved: 100,
                Rejected: 100,
              };
            } else if (row?.category === "Demob") {
              return {
                "Pending For CM": 30,
                "Pending For PM": 70,
                "Pending For PD": 85,
                Approved: 100,
                Rejected: 100,
              };
            } else {
              return {
                "Pending For HOD": 40,
                "Pending For GM": 60,
                "Pending For CEO": 80,
                Approved: 100,
                Rejected: 100,
              };
            }
          }
          return {};
        };
        const isDeleted = rowData.deleted;
        const displayStatus = isDeleted ? "Deleted" : formattedstatus;
        const progressMap = getStatusProgress(rowData);
        const progress = progressMap[formattedstatus] || 0;

        const progressColor =
          formattedstatus === "Rejected"
            ? "bg-red-500"
            : formattedstatus === "Approved"
              ? "bg-green-500"
              : formattedstatus === "review"
                ? "bg-amber-500"
                : formattedstatus === "Pending For HOD"
                  ? "bg-yellow-400"
                  : formattedstatus === "Pending For SFM"
                    ? "bg-indigo-400"
                    : formattedstatus === "Pending For CM"
                      ? "bg-amber-500"
                      : formattedstatus === "Pending For GM"
                        ? "bg-orange-500"
                        : formattedstatus === "Pending For PM"
                          ? "bg-lime-500"
                          : formattedstatus === "Pending For PD"
                            ? "bg-teal-500"
                            : formattedstatus === "Pending For CEO"
                              ? "bg-violet-600"
                              : "bg-gray-400";

        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 flex gap-2 items-center">
              {displayStatus === "Review" ? (
                <>
                  <IoWarningOutline className="text-yellow-500" size={18} />
                  <span>To be Reviewed</span>
                </>
              ) : (
                displayStatus || "Not Sent For Approval"
              )}
            </span>

            <div className="relative max-w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-2 ${progressColor} rounded-full transition-all duration-500 `}
                style={{
                  width: `${progress}%`,
                }}
              />
              {/* Progress indicator dot */}
              {rowData.status != "approved" && rowData.status != "rejected" && (
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 ${progressColor} rounded-full border-2 border-white shadow-md transition-all duration-500`}
                  style={{
                    left: `${progress}%`,
                  }}
                />
              )}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor(
      (row) => {
        const comments = row?.approver_info?.filter(
          (a) => a.comment != undefined,
        );
        return comments;
      },
      {
        id: "comments",
        header: "Comments",
        meta: {
          className:
            "min-w-[150px] max-w-[200px] whitespace-pre-wrap break-words",
        },
        cell: (info) => {
          const comments = info.getValue();
          const rowData = info.row.original;
          const ischanged = rowData["w.e.f_changed"] ?? false;
          if (
            comments &&
            typeof comments === "object" &&
            Object.values(comments).length > 0
          ) {
            return (
              <div className="space-y-1">
                {ischanged && (
                  <span className="inline-flex rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    Demob date changed
                  </span>
                )}
                <div className="max-h-22 space-y-1 overflow-y-auto">
                  {Object.entries(comments)
                    .reverse()
                    .map(([key, value]) =>
                      value.comment?.trim() ? (
                        <div key={key}>
                          {value.comment !== "" && (
                            <>
                              <strong className="capitalize">
                                {value.role != "initfn" && value.role != "inita"
                                  ? value.role.toUpperCase() + ":"
                                  : "Initiator" + ":"}
                              </strong>{" "}
                              {value.comment}
                            </>
                          )}
                        </div>
                      ) : null,
                    )}
                </div>
              </div>
            );
          } else {
            return (
              <div className="space-y-1">
                {ischanged && (
                  <span className="inline-flex rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    Demob date changed
                  </span>
                )}
                {!ischanged && "-"}
              </div>
            );
          }
        },
      },
    ),
  ];
  const tableFeaturesConfig = tableFeatures({
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
    rowExpandingFeature,
    expandedRowModel: createExpandedRowModel(),
  });

  const table = useTable({
    data: fndata || [],
    columns,
    features: tableFeaturesConfig,
    state: { pagination },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      if (!next) return;
      setPageIndex(next.pageIndex ?? pagination.pageIndex);
      setPageSize(next.pageSize ?? pagination.pageSize);
    },
    pageCount: Math.ceil(total / pagination.pageSize),
  });

  useEffect(() => {
    let cat = [];
    let depttypes = [];
    if (isplant) {
      depttypes = getTypes();
      setTypes(depttypes);
      if (userInfo.role.includes("gm") || userInfo.role.includes("ceo")) {
        cat = getcategory(typeFilter);
      } else if (
        userInfo.role.includes("initpr") &&
        userInfo.role.includes("initdc")
      ) {
        cat = getcategory(typeFilter).filter(
          (c) => c.includes("Demob") || c.includes("FWA"),
        );
      } else if (userInfo.role.includes("initpr")) {
        cat = getcategory(typeFilter).filter((c) => c.includes("Demob"));
      } else if (
        userInfo.role.includes("cm") ||
        userInfo.role.includes("pm") ||
        userInfo.role.includes("pd")
      ) {
        cat = getcategory(typeFilter).filter(
          (c) => c.includes("FWA") || c.includes("Demob"),
        );
      } else if (userInfo.role.includes("initdc")) {
        cat = getcategory(typeFilter).filter((c) => c.includes("FWA"));
      } else if (userInfo.role.includes("inith")) {
        cat = getcategory(typeFilter).filter((c) => !c.includes("FWA"));
      } else if (userInfo.role.includes("initfn") && isAdmin) {
        cat = getcategory(typeFilter).filter(
          (c) => !c.includes("FWA") && !c.includes("Demob"),
        );
      } else if (userInfo.role.includes("view")) {
        cat = getcategory(typeFilter).filter((c) => c.includes("Demob"));
      } else if (userInfo.role.includes("hod")) {
        cat = getcategory(typeFilter).filter((c) => !c.includes("FWA"));
      } else {
        cat = getcategory(typeFilter).filter(
          (c) => !c.includes("Demob") && !c.includes("FWA"),
        );
      }
      setCategories(cat);
    }
  }, [typeFilter, categoryFilter]);
  const cmusers =
    userInfo?.role?.includes("cm") && userInfo?.role?.includes("initfn");
  const pmusers =
    userInfo?.role?.includes("pm") && userInfo?.role?.includes("initfn");
  const initusers =
    userInfo?.role?.includes("initfn") &&
    !userInfo?.role?.includes("initpr") &&
    !userInfo.role.includes("initdc");
  const multiinit =
    userInfo?.role?.includes("initfn") &&
    userInfo?.role?.includes("initpr") &&
    userInfo.role.includes("initdc");
  const multiprojects = userInfo?.pr_code?.length > 1;
  const projectDefaultCategory =
    ["Demob", "FWA"].includes(requestedProjectIocCategory) &&
    projectIocAccess.navigationCategories.includes(requestedProjectIocCategory)
      ? requestedProjectIocCategory
      : projectIocAccess.navigationCategories[0] ||
        projectIocAccess.defaultCategory;
  const hasActiveFilters = Boolean(
    statusfilter !== "All" ||
      searchcsno ||
      searchcsname ||
      selectedproject ||
      (!isProjectsIocEntry && (typeFilter || categoryFilter)),
  );
  const handleClearFilters = () => {
    setStatusFilter("All");
    setTypeFilter(isProjectsIocEntry ? "ioc" : "");
    setCategoryFilter(isProjectsIocEntry ? projectDefaultCategory : "");
    setSelectedProject("");
    setSearchCSNo("");
    setSearchCSName("");
    setSearch({ isText: true, isNumber: false, value: "" });
    setPageIndex(0);
  };
  useEffect(() => {
    if (!isProjectsIocEntry || !projectIocAccess.canAccess) return;

    setTypeFilter("ioc");
    setCategoryFilter(projectDefaultCategory);
    setSelectedProject("");
    setPageIndex(0);

    const loadProjectCodes = async () => {
      try {
        const projects = await fetchProjectDetails(userInfo);
        const availableProjects = projects.map((project) => project.project);
        const assignedProjects = userInfo?.pr_code || [];
        const canViewAllProjects = userInfo?.role?.some((role) =>
          ["gm", "hod", "fm", "ceo"].includes(role.toLowerCase()),
        );

        setProjectCodes(
          canViewAllProjects
            ? availableProjects
            : availableProjects.filter((project) =>
                assignedProjects.includes(project),
              ),
        );
      } catch (error) {
        console.error("Unable to load IOC project filters", error);
        setProjectCodes([]);
      }
    };

    loadProjectCodes();
  }, [isProjectsIocEntry, projectDefaultCategory]);

  useEffect(() => {
    const leftProjectsIoc =
      previousProjectsIocEntry.current && !isProjectsIocEntry;

    if (leftProjectsIoc) {
      setTypeFilter("");
      setCategoryFilter("");
      setSelectedProject("");
      setProjectCodes([]);
      setPageIndex(0);
    }

    previousProjectsIocEntry.current = isProjectsIocEntry;
  }, [isProjectsIocEntry]);

  useEffect(() => {
    sessionStorage.setItem(
      "filenoteFilters",
      JSON.stringify({
        categoryFilter,
        typeFilter,
        projectFilter: selectedproject,
      }),
    );
  }, [categoryFilter, typeFilter, selectedproject]);
  return (
    <main className="dashboard-shell relative flex h-0 min-h-0 w-full flex-grow flex-col overflow-hidden bg-slate-50 px-2 pb-0 pt-2 sm:px-3">
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="mb-3 flex shrink-0 flex-col gap-2 rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-[0_1px_2px_rgb(15_23_42/0.04)] sm:p-2 lg:flex-row lg:items-center lg:justify-between">
          <DashboardStatusNav>
            {["All", "Approved", "Rejected", "Pending", "Under Review"].map(
              (tab) => {
                const isActive =
                  (tab === "All" && statusfilter === "All") ||
                  (tab === "Approved" && statusfilter === "Approved") ||
                  (tab === "Rejected" && statusfilter === "Rejected") ||
                  (tab === "Pending" && statusfilter === "Pending") ||
                  (tab === "Under Review" && statusfilter === "review");

                return (
                  <button
                    key={tab}
                    onClick={() => {
                      switch (tab) {
                        case "All":
                          setStatusFilter("All");
                          setPageIndex(0);
                          break;
                        case "Approved":
                          setStatusFilter("Approved");
                          setPageIndex(0);
                          break;
                        case "Rejected":
                          setStatusFilter("Rejected");
                          setPageIndex(0);
                          break;
                        case "Pending":
                          setStatusFilter("Pending");
                          setPageIndex(0);
                          break;
                        case "Under Review":
                          setStatusFilter("review");
                          setPageIndex(0);
                          break;
                      }
                    }}
                    className={getDashboardStatusTabClass(tab, isActive)}
                  >
                    {tab}
                  </button>
                );
              },
            )}
          </DashboardStatusNav>
          <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center lg:w-auto">
            {(isProjectsIocEntry ||
              cmusers ||
              pmusers ||
              initusers ||
              initiatorCapabilities.demob ||
              initiatorCapabilities.hwa ||
              multiinit ||
              multiprojects) && (
              <div className="w-full min-w-0 xl:w-auto xl:min-w-max">
                <TypeFilter
                  type={typeFilter}
                  category={categoryFilter}
                  projectcodes={projectcodes}
                  settype={setTypeFilter}
                  setCategory={setCategoryFilter}
                  setProjectCodes={setProjectCodes}
                  types={isProjectsIocEntry ? ["ioc"] : types}
                  categories={
                    isProjectsIocEntry
                      ? getProjectIocCategoryOptions(
                          categories,
                          projectIocAccess.navigationCategories,
                        )
                      : categories
                  }
                  selectedproject={selectedproject}
                  setSelectedProject={setSelectedProject}
                  setSearch={setSearch}
                  setSearchCSNo={setSearchCSNo}
                  setSearchCSName={setSearchCSName}
                  multiinit={multiinit}
                  onClearFilters={handleClearFilters}
                  showClearFilters={hasActiveFilters}
                />
              </div>
            )}
            <div className="flex items-center">
              <InputSearch
                handleSearch={handleSearch}
                search={search}
                setSearch={setSearch}
                setSearchCSNo={setSearchCSNo}
                setSearchCSName={setSearchCSName}
                module="fn"
              />
            </div>
          </div>
        </div>
        {
          <div className="relative min-h-0 flex-1 overflow-auto rounded border border-gray-200 bg-white shadow [scrollbar-width:thin]">
            <Loading isLoading={isLoading} />
            <table className="w-full min-w-0 divide-y divide-gray-200">
              <thead className="top-0 z-10 sticky  bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`border-b border-gray-300 px-2 text-left text-sm font-semibold text-gray-700 ${header.column.columnDef.meta?.className || ""}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : header.column.columnDef.header}
                      </th>
                    ))}
                    <th className="border-b border-gray-300 px-2 py-2 text-center text-sm font-semibold text-gray-700">
                      Action
                    </th>
                    <th className="w-20 border-b border-gray-300 px-2 py-2 text-center text-sm font-semibold text-gray-700">
                      Created
                    </th>
                    <th className="w-32 min-w-32 text-nowrap border-b border-gray-300 px-2 py-2 text-center text-sm font-semibold text-gray-700">
                      {userInfo?.is_admin ? "Last Activity" : "Submitted"}
                    </th>
                    <th className="w-10 border-b border-gray-300 px-1 py-2 text-center text-sm font-semibold text-gray-700"></th>
                    <th className="w-10 border-b border-gray-300 px-1 py-2 text-center text-sm font-semibold text-gray-700"></th>
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="text-center py-4 text-gray-500"
                    >
                      No Statements found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`odd:bg-slate-50 even:bg-white transition-colors hover:bg-blue-50/70 ${
                        row.original.deleted != 0
                          ? "!bg-red-50 text-red-400 border-l-4 border-red-400/60 opacity-60 grayscale"
                          : ""
                      }`}
                    >
                      {(row.getVisibleCells?.() ?? row.getAllCells()).map(
                        (cell) => (
                          <td
                            key={cell.id}
                            className={`border-b  border-gray-300 px-2 py-2 text-sm text-gray-700 ${cell.column.columnDef.meta?.className || ""}`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ),
                      )}

                      <td className="whitespace-nowrap border-b border-gray-300 px-1 py-1 text-center text-sm text-gray-700">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                            onClick={() => setNewfn(false)}
                            to={
                              initiatorCapabilities.canAccessFNIOC
                                ? `/filenote/${row.original?.id}`
                                : "/login"
                            }
                          >
                            <LuEye size={14} /> View
                          </Link>
                          <button
                            type="button"
                            disabled={
                              !(
                                userInfo?.is_admin ||
                                userInfo.role?.includes("initpr") ||
                                demob_intimators ||
                                isgm ||
                                row.original.category == "Demob"
                              )
                            }
                            className={`inline-flex h-7 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border px-2 text-xs font-semibold transition ${
                              userInfo?.is_admin ||
                              userInfo.role?.includes("initpr") ||
                              demob_intimators ||
                              isgm ||
                              row.original.category == "Demob"
                                ? "cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            }`}
                            onClick={async () => {
                              const data = await getstatement(row.original?.id);
                              handleFnPrint(data, userInfo);
                            }}
                          >
                            <LuFileDown size={14} /> PDF
                          </button>
                          {userInfo?.is_admin && (
                            <button
                              type="button"
                              className={`inline-flex h-7 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 ${row.original.status === "approved" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                              aria-label="Delete statement"
                              onClick={() => {
                                if (row.original.status === "approved") return;
                                setDeleteStatement(row.original.id);
                              }}
                            >
                              <LuTrash2 size={14} /> Delete
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="w-20 border-b border-gray-300 px-2 py-2 text-center text-sm text-gray-700">
                        {formatDateDDMMYYYY(row.original.created_at)}
                      </td>
                      <td className="w-32 min-w-32 border-b border-gray-300 px-2 py-2 text-center text-[13px] leading-tight text-gray-700">
                        {userInfo?.is_admin
                          ? getlastSubmittedDate(
                              row?.original?.approver_info,
                              userInfo?.role[0],
                            ) || ""
                          : getSubmittedDate(
                              row?.original?.approver_info,
                              userInfo?.role[0],
                              "fn",
                            ) || ""}
                      </td>
                      <td className="w-10 px-1 text-center">
                        {row.original.file_name?.length > 0 && (
                          <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <GrAttachment size={12} />
                            <span>{row.original.file_name.length}</span>
                          </span>
                        )}
                      </td>
                      <td className="w-10 px-1 text-center">
                        {" "}
                        {row.original.demob_intimated && demob_intimators && (
                          <BiBadgeCheck
                            color="green"
                            size={20}
                            title={
                              row.original.intimated_by
                                ? "Intimated by " + row.original.intimated_by
                                : "Intimated"
                            }
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-1 py-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center text-sm font-semibold text-slate-600">
                Total Number of Records: {total}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Rows per page:</span>
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageIndex(0);
                    }}
                    className="h-6 rounded-md border border-slate-300 bg-white px-1 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPageIndex(0)}
                    disabled={pagination.pageIndex == 0}
                    className={`h-6 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 motion-reduce:transition-none ${pagination.pageIndex == 0 ? "cursor-auto" : "cursor-pointer"}`}
                  >
                    «
                  </button>

                  <button
                    onClick={() => setPageIndex(pagination.pageIndex - 1)}
                    disabled={pagination.pageIndex == 0}
                    className={`h-6 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 motion-reduce:transition-none ${pagination.pageIndex != 0 ? "cursor-pointer" : ""}`}
                  >
                    ‹ Prev
                  </button>

                  <span className="px-1.5 text-sm text-slate-600">
                    Page{" "}
                    <strong>{total != 0 ? pagination.pageIndex + 1 : 0}</strong>{" "}
                    of <strong>{Math.ceil(total / pagination.pageSize)}</strong>
                  </span>

                  <button
                    onClick={() => setPageIndex(pagination.pageIndex + 1)}
                    disabled={
                      pagination.pageIndex + 1 >=
                      Math.ceil(total / pagination.pageSize)
                    }
                    className={`h-6 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 motion-reduce:transition-none ${
                      pagination.pageIndex + 1 >=
                      Math.ceil(total / pagination.pageSize)
                        ? "cursor-auto"
                        : "cursor-pointer"
                    }`}
                  >
                    Next ›
                  </button>

                  <button
                    onClick={() =>
                      setPageIndex(Math.ceil(total / pagination.pageSize) - 1)
                    }
                    disabled={
                      pagination.pageIndex ==
                      Math.max(Math.ceil(total / pagination.pageSize) - 1, 0)
                    }
                    className={`h-6 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 motion-reduce:transition-none ${
                      pagination.pageIndex ==
                      Math.max(Math.ceil(total / pagination.pageSize) - 1, 0)
                        ? "cursor-auto"
                        : "cursor-pointer"
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        {deleteStatement?.open && (
          <Alerts
            message="Are you sure you want to Delete the Selected statement?"
            onCancel={() => resetDeleteStatement()}
            onConfirm={() => {
              handleDelete(deleteStatement.id);
            }}
          />
        )}
        {showtoast && !errormessage && (
          <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
            <SiTicktick /> Statement Removed Successfully!
          </div>
        )}
        {showtoast && errormessage && (
          <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
            <MdOutlineError /> {errormessage}
          </div>
        )}
      </div>
    </main>
  );
};

export default FnDashboards;
