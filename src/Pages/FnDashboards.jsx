import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { deletefn, fetchfilenoteids, fetchfilenoteidvalue } from "../APIs/api";
import { Link, useLocation } from "react-router-dom";
import useuserInfo from "../CustomHooks/useUserInfo";
import { useStatusFilter } from "../store/logisticsStore";
import { dept_finder, is_plant } from "../Helpers/dept_helper";
import { FaArrowAltCircleRight, FaTrash } from "react-icons/fa";
import { usePagination } from "../store/statementStore";
import { useEffect, useState } from "react";
import { IoPrint, IoWarningOutline } from "react-icons/io5";
import Alerts from "../Components/Alerts";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { SiTicktick } from "react-icons/si";
import { MdOutlineError } from "react-icons/md";
import { handleFnPrint } from "../Helpers/print_helper";
import {
  formatDateDDMMYYYY,
  getlastSubmittedDate,
  getSubmittedDate,
  getType,
} from "../Helpers/helperfunctions";
import { BiBadgeCheck } from "react-icons/bi";
import {
  useCategories,
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
const FnDashboards = () => {
  const userInfo = useuserInfo();
  const isAdmin = userInfo.is_admin;
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
  const { newfn, setNewfn } = usenewfn();
  const [categoryFilter, setCategoryFilter] = useState(() => {
    const saved = sessionStorage.getItem("filenoteFilters");
    return saved ? JSON.parse(saved).categoryFilter || "" : "";
  });
  const [typeFilter, setTypeFilter] = useState(() => {
    const saved = sessionStorage.getItem("filenoteFilters");
    return saved ? JSON.parse(saved).typeFilter || "" : "";
  });
  const { setStatusFilter, statusfilter, resetStatusFilter } =
    useStatusFilter();
  const { projectcodes, setProjectCodes } = useProjectCodes();
  // const [selectedproject, setSelectedProject] = useState([]);
  const { selectedproject, setSelectedProject } = useSelectedProject();
  // const [categories, setCategories] = useState([]);
  const { categories, setCategories } = useCategories();
  const { types, setTypes } = useTypes();
  const isgm = userInfo.role.includes("gm");
  const [total, setTotal] = useState(0);
  const isplant = is_plant(userInfo?.dept_code);
  const demob_intimators =
    userInfo.role.includes("inith") || userInfo.role.includes("hod");
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
    keepPreviousData: true,
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
      await deletefn(id, userInfo);
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
        resetDeleteStatement();
      }, 1000);
      queryClient.invalidateQueries(["fnid"]);
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
  const hideDepartColumn = fndata?.some((row) => row.category !== "FWA");

  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      meta: { className: "min-w-20  whitespace-pre-wrap break-words" },
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor((row) => row?.doc_no, {
      id: "doc_id",
      header: "Doc. No.",
      cell: (info) => {
        const type = info.row.original?.type == "ioc" ? "IOC" : "FN";
        const category = info.row.original?.category.toUpperCase();
        return `${type}/  ${category} -  ${info.getValue() || ""}`;
      },
    }),
    columnHelper.accessor((row) => row?.name, {
      id: "subject",
      header: "Subject",
      meta: { className: "max-w-70  whitespace-pre-wrap break-words" },
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
    ...(hideDepartColumn
      ? [
          columnHelper.accessor(
            (row) => {
              const dept = dept_finder(row?.department_id);
              return dept === "Plant & Equipment" ? "P&E" : dept;
            },
            {
              id: "department",
              header: "Dept.",
              cell: (info) => info.getValue() || "-",
            },
          ),
        ]
      : []),

    columnHelper.accessor((row) => row?.status, {
      id: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() || "";
        const formattedstatus = status
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase(),
          )
          .join(" ");

        const rowData = info.row.original;
        const getStatusProgress = (row) => {
          if (row?.type === "file_note") {
            if (row?.category === "General" || row?.category === "TFW") {
              return {
                "Pending For Hod": 40,
                "Pending For Gm": 60,
                "Pending For Ceo": 80,
                Approved: 100,
                Rejected: 100,
              };
            } else {
              return {
                "Pending For Hod": 20,
                "Pending For Sfm": 40,
                "Pending For Gm": 60,
                "Pending For Ceo": 80,
                Approved: 100,
                Rejected: 100,
              };
            }
          } else if (row?.type === "ioc") {
            if (row?.category === "FWA") {
              return {
                "Pending For Cm": 35,
                "Pending For Pm": 50,
                "Pending For Pd": 60,
                "Pending For Gm": 80,
                Approved: 100,
                Rejected: 100,
              };
            } else if (row?.category === "Demob") {
              return {
                "Pending For Cm": 30,
                "Pending For Pm": 70,
                "Pending For Pd": 85,
                Approved: 100,
                Rejected: 100,
              };
            } else {
              return {
                "Pending For Hod": 40,
                "Pending For Gm": 60,
                "Pending For Ceo": 80,
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
                : formattedstatus === "Pending For Hod"
                  ? "bg-yellow-400"
                  : formattedstatus === "Pending For Sfm"
                    ? "bg-indigo-400"
                    : formattedstatus === "Pending For Cm"
                      ? "bg-amber-500"
                      : formattedstatus === "Pending For Gm"
                        ? "bg-orange-500"
                        : formattedstatus === "Pending For Pm"
                          ? "bg-lime-500"
                          : formattedstatus === "Pending For Pd"
                            ? "bg-teal-500"
                            : formattedstatus === "Pending For Ceo"
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
        const comments = row.approver_info ?? "";
        return comments;
      },
      {
        id: "comments",
        header: "Comments",
        meta: { className: "w-60 max-w-xs whitespace-pre-wrap break-words" },
        cell: (info) => {
          const comments = info.getValue();
          if (
            comments &&
            typeof comments === "object" &&
            Object.keys(comments).length > 0
          ) {
            return (
              <div className="space-y-1 overflow-y-auto max-h-22 ">
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
            );
          } else {
            return "-";
          }
        },
      },
    ),
  ];
  const table = useReactTable({
    data: fndata || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPageSize,
    pageCount: Math.ceil(total / pagination.pageSize),
    getExpandedRowModel: getExpandedRowModel(),
  });

  useEffect(() => {
    let cat = [];
    let depttypes = [];
    if (isplant) {
      depttypes = getTypes();
      setTypes(depttypes);
      if (userInfo.role.includes("gm")) {
        cat = getcategory(typeFilter);
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
      } else if (userInfo.role.includes("inith")) {
        cat = getcategory(typeFilter).filter((c) => !c.includes("FWA"));
      } else if (userInfo.role.includes("initfn") && isAdmin) {
        cat = getcategory(typeFilter).filter(
          (c) => !c.includes("FWA") && !c.includes("Demob"),
        );
      } else if (userInfo.role.includes("ceo")) {
        cat = getcategory(typeFilter).filter(
          (c) => !c.includes("Demob") && !c.includes("FWA"),
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
    <div className="flex-grow ">
      <div className="flex-grow w-full px-5">
        <div className="flex border-b justify-between items-center border-gray-300 mb-4">
          <div className="text-nowrap">
            {["All", "Approved", "Rejected", "Pending", "Under Review"].map(
              (tab) => {
                const isActive =
                  (tab === "All" && statusfilter === "All") ||
                  (tab === "Approved" && statusfilter === "Approved") ||
                  (tab === "Rejected" && statusfilter === "Rejected") ||
                  (tab === "Pending" && statusfilter === "Pending") ||
                  (tab === "Under Review" && statusfilter === "review");

                let activeColor = "border-blue-500 text-blue-600";
                let inactiveColor =
                  "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

                if (tab === "Approved") {
                  activeColor = "border-green-500 text-green-600";
                  inactiveColor =
                    "border-transparent text-gray-500 hover:text-green-500";
                } else if (tab === "Rejected") {
                  activeColor = "border-red-500 text-red-600";
                  inactiveColor =
                    "border-transparent text-gray-500 hover:text-red-500";
                } else if (tab === "Pending") {
                  activeColor = "border-yellow-500 text-yellow-600";
                  inactiveColor =
                    "border-transparent text-gray-500 hover:text-yellow-500";
                } else if (tab === "Under Review") {
                  activeColor = "border-cyan-500 text-cyan-600";
                  inactiveColor =
                    "border-transparent text-gray-500 hover:text-cyan-500";
                }

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
                    className={`px-4 py-2 -mb-px border-b-2 font-medium cursor-pointer transition-colors ${
                      isActive ? activeColor : inactiveColor
                    }`}
                  >
                    {tab}
                  </button>
                );
              },
            )}
          </div>
          {(cmusers || pmusers || initusers) && (
            <div className="ml-auto flex">
              <TypeFilter
                type={typeFilter}
                category={categoryFilter}
                projectcodes={projectcodes}
                settype={setTypeFilter}
                setCategory={setCategoryFilter}
                setProjectCodes={setProjectCodes}
                types={types}
                categories={categories}
                selectedproject={selectedproject}
                setSelectedProject={setSelectedProject}
                setSearch={setSearch}
                setSearchCSNo={setSearchCSNo}
                setSearchCSName={setSearchCSName}
              />
            </div>
          )}
          <div className="flex ">
            {
              <div className="flex px-4 py-2 -mb-px items-center justify-center ml-auto"></div>
            }
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
        {
          <div
            className="relative overflow-y-auto bg-white shadow rounded border border-gray-200"
            style={{ height: `calc(93vh - 140px)` }}
          >
            <Loading isLoading={isLoading} />
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="top-0 z-10 sticky  bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="border-b border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                      >
                        {header.isPlaceholder
                          ? null
                          : header.column.columnDef.header}
                      </th>
                    ))}
                    <th className=" border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                      Action
                    </th>
                    <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                      Created
                    </th>
                    <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center text-nowrap">
                      {userInfo?.is_admin ? "Last Activity" : "Submitted"}
                    </th>
                    <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center"></th>
                    <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center"></th>
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
                      className={`even:bg-white odd:bg-gray-50 hover:bg-blue-100 ${
                        row.original.deleted != 0
                          ? "bg-red-50 text-red-400 border-l-4 border-red-400/60 opacity-60 grayscale"
                          : ""
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`border-b  border-gray-300 px-4 py-2 text-sm text-gray-700 ${cell.column.columnDef.meta?.className || ""}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}

                      <td className="border-gray-300 border-b px-2 py-2 text-sm text-gray-700 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <Link
                            className="px-2 py-1 bg-blue-500 text-white rounded inline-flex justify-center items-center gap-2 hover:bg-blue-600 cursor-pointer"
                            onClick={() => setNewfn(false)}
                            to={
                              userInfo?.role?.includes("initfn")
                                ? `/filenote/${row.original?.id}`
                                : "/login"
                            }
                          >
                            View <FaArrowAltCircleRight />
                          </Link>
                          <IoPrint
                            className={
                              userInfo?.is_admin ||
                              userInfo.role?.includes("initpr") ||
                              demob_intimators ||
                              isgm ||
                              row.original.category == "Demob"
                                ? "text-black cursor-pointer"
                                : "text-gray-400 pointer-events-none cursor-not-allowed"
                            }
                            size={25}
                            onClick={async () => {
                              const data = await getstatement(row.original?.id);
                              handleFnPrint(data, userInfo);
                            }}
                          />
                          <FaTrash
                            className={`mr-1 text-red-500  ${!userInfo?.is_admin ? "hidden" : row.original.status === "approved" ? "cursor-not-allowed  opacity-50 scale-95" : "cursor-pointer"} `}
                            size={16}
                            onClick={() => {
                              if (row.original.status === "approved") return;
                              setDeleteStatement(row.original.id);
                            }}
                          />
                        </div>
                      </td>

                      <td className="border-gray-300 border-b px-4 py-2 text-sm text-gray-700 text-center">
                        {formatDateDDMMYYYY(row.original.created_at)}
                      </td>
                      <td className="border-gray-300 border-b px-4 py-2 text-[13px] text-gray-700 text-center w-32">
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
                      <td>
                        {row.original.file_name?.length > 0 && (
                          <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <GrAttachment size={12} />
                            <span>{row.original.file_name.length}</span>
                          </span>
                        )}
                      </td>
                      <td>
                        {" "}
                        {row.original.demob_intimated && demob_intimators && (
                          <BiBadgeCheck
                            color="green"
                            size={20}
                            title={
                              row.original.intimated_by
                                ? "Intimated by" + row.original.intimated_by
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
            <div className={`flex justify-between`}>
              <div className="ml-2 flex items-center text-sm text-gray-700 font-medium">
                Total Number of Records: {total}
              </div>

              <div className="flex items-center gap-2 p-2 justify-end ">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rows per page:</span>
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageIndex(0);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 ">
                  <button
                    onClick={() => setPageIndex(0)}
                    disabled={pagination.pageIndex == 0}
                    className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 cursor-pointer ${pagination.pageIndex == 0 ? "cursor-auto" : "cursor-pointer"}`}
                  >
                    «
                  </button>

                  <button
                    onClick={() => setPageIndex(pagination.pageIndex - 1)}
                    disabled={pagination.pageIndex == 0}
                    className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${pagination.pageIndex != 0 ? "cursor-pointer" : ""}`}
                  >
                    ‹ Prev
                  </button>

                  <span className="text-sm px-2">
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
                    className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${
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
                    className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${
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
    </div>
  );
};

export default FnDashboards;
