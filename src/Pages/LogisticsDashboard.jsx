import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import useUserInfo from "../CustomHooks/useUserInfo";
import {
  fetchallstatements,
  fetchApproverDetails,
  fetchCsCount,
  fetchStatement,
  getcmpmNames,
} from "../APIs/api";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  useDashboardType,
  useHistoryData,
  useIdHistory,
  useMultiStatusFilter,
  usePmName,
  useSelectedProject,
  useStatusFilter,
} from "../store/logisticsStore";
import { IoPrint, IoWarningOutline } from "react-icons/io5";
import DashboardButton from "../Components/DashboardButton";
import {
  is_buyrent,
  is_gm,
  is_logistics,
  is_plant,
} from "../Helpers/dept_helper";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowCircleRight, FaTrash } from "react-icons/fa";
import Alerts from "../Components/Alerts";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { SiTicktick } from "react-icons/si";
import { MdOutlineErrorOutline } from "react-icons/md";
import { handlePrint } from "../Helpers/print_helper";
import { FaHistory } from "react-icons/fa";
import ApprovalHistory from "../Components/ApprovalHistory";
import { usePagination, usetotalReceipts } from "../store/statementStore";
import {
  formatDateDDMMYYYY,
  getlastSubmittedDate,
  getSubmittedDate,
} from "../Helpers/helperfunctions";
import InputSearch from "../Components/InputSearch";
import Loading from "../Components/Loading";
const LogisticsDashboard = () => {
  const userInfo = useUserInfo();
  const { setStatusFilter, statusfilter, resetStatusFilter } =
    useStatusFilter();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { approverhistory, setApproverHistory, resetApproverHistory } =
    useHistoryData();
  const { selectedproject, setSelectedProject } = useSelectedProject();
  const { dashboardType, setDashboardType } = useDashboardType();
  const { resetPmName, setPmName } = usePmName();
  const isLogistics = is_logistics(userInfo?.dept_code);
  const { errormessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();
  const { receiptscount, setReceiptsCount } = usetotalReceipts();
  const { pagination, setPageIndex, setPageSize } = usePagination();
  const queryClient = useQueryClient();
  const [deletestatement, setDeleteStatement] = useState({
    id: null,
    open: false,
  });
  const isPlant = is_plant(userInfo?.dept_code);
  const isBuyvsrent = is_buyrent(userInfo?.dept_code);
  const { selectedId, resetSelectedId } = useIdHistory();
  const [searchcsno, setSearchCSNo] = useState(null);
  const [searchcsname, setSearchCSName] = useState(null);
  const [search, setSearch] = useState({
    isNumber: false,
    isText: true,
    value: null,
  });
  const isgm = is_gm(userInfo?.role);

  const { data: allstatements, isLoading } = useQuery({
    queryKey: [
      "csid",
      pagination.pageSize,
      statusfilter,
      pagination.pageIndex,
      searchcsno,
      searchcsname,
    ],
    queryFn: () =>
      fetchallstatements(
        statusfilter,
        userInfo,
        pagination.pageSize,
        pagination.pageIndex,
        searchcsno,
        searchcsname,
      ),
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

  const getstatement = async (cs_id) => {
    try {
      let response = await fetchStatement(userInfo, cs_id);
      return response.data;
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

  const handleDelete = async (id) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(
        `${REACT_SERVER_URL}/logistics/delete/${id}`,
        {},
        config,
      );
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
      }, 1000);
      queryClient.invalidateQueries(["csid"]);
      setDeleteStatement({ open: false });
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

  const fetchPmName = async (project) => {
    try {
      const res = await getcmpmNames("pm", project, userInfo);
      const name = res?.data ?? res ?? [];
      if (Array.isArray(name) && name.length > 0) {
        setPmName(name);
      } else {
        resetPmName();
      }
    } catch (error) {
      setErrorMessage("Cant fetch the PM Name");
      console.error("Error fetching PM name:", error);
      resetPmName();
      setTimeout(() => {
        clearErrorMessage();
      }, 1000);
    }
  };

  const handleApprovalHistory = async (cs_id) => {
    setStatusFilter("Approval History");
    const Approvals = await fetchApproverDetails(userInfo, cs_id);
    const name = fetchPmName(Approvals.project);
    setPmName(name);
    setSelectedProject(Approvals.project);
    setApproverHistory(Approvals);
    resetSelectedId();
  };

  useEffect(() => {
    if (!selectedId) return;
    if (selectedId == "default") {
      resetApproverHistory();
    }
    handleApprovalHistory(selectedId);
  }, [selectedId]);

  useEffect(() => {
    const fetchStatments = async () => {
      try {
        const totalcount = await fetchCsCount(
          userInfo,
          statusfilter,
          searchcsno,
          searchcsname,
          userInfo.pr_code,
        );
        setReceiptsCount(totalcount.receipts_count);
      } catch (error) {
        const message = error?.response?.data?.message || error.message;
        console.error("Fetch receipts error:", message);
      }
    };
    fetchStatments();
  }, [statusfilter, searchcsno, searchcsname]);

  useEffect(() => {
    setDashboardType("logistics");
  }, []);

  const columnHelper = createColumnHelper();
  const statusProgress = {
    "Pending For Incharge": 20,
    "Pending For Pm": 30,
    "Pending For Pd": 50,
    "Pending For Gm": 60,
    "Pending For Fm": 80,
    "Pending For Ceo": 90,
    Approved: 100,
    Rejected: 100,
    "": 0,
  };
  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor((row) => row?.shipment_no, {
      id: "shipment",
      header: "Shipment No.",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.id, {
      id: "csno",
      header: "Cs No.",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.project, {
      id: "project",
      header: "Project",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.cargo_details, {
      id: "cargo",
      header: "Cargo Details",
      cell: (info) => info.getValue() || "-",
    }),

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
        const isDeleted = rowData.deleted;
        const progress = statusProgress[formattedstatus] || 0;
        const displayStatus = isDeleted ? "Deleted" : formattedstatus;
        const progressColor =
          formattedstatus === "Rejected"
            ? "bg-rose-500"
            : formattedstatus === "Approved"
              ? "bg-emerald-500"
              : formattedstatus === "Review"
                ? "bg-sky-500"
                : formattedstatus === "Pending For Pm"
                  ? "bg-orange-400"
                  : formattedstatus === "Pending For Incharge"
                    ? "bg-yellow-400"
                    : formattedstatus === "Pending For Fm"
                      ? "bg-indigo-400"
                      : formattedstatus === "Pending For Gm"
                        ? "bg-amber-500"
                        : formattedstatus === "Pending For Pd"
                          ? "bg-teal-500"
                          : formattedstatus === "Pending For Ceo"
                            ? "bg-violet-500"
                            : "bg-gray-300";

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

            <div
              className="relative  h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner cursor-pointer"
              onClick={() => handleApprovalHistory(info.row.original.id)}
            >
              <div
                className={`h-2 ${progressColor} rounded-full transition-all duration-500 `}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        );
      },
    }),

    columnHelper.accessor(
      (row) => {
        const approverComments = Array.isArray(row.approver_info)
          ? [...row.approver_info]
              .filter((r) => r.comments)
              .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
          : [];

        const fallbackComments = [
          row.comment_ceo && { role: "ceo", comments: row.comment_ceo },
          row.comment_fm && { role: "fm", comments: row.comment_fm },
          row.comment_gm && { role: "gm", comments: row.comment_gm },
          row.comment_pd && { role: "pd", comments: row.comment_pd },
          row.comment_pm && { role: "pm", comments: row.comment_pm },
          row.comment_in && { role: "incharge", comments: row.comment_in },
        ].filter(Boolean);

        return approverComments.length > 0
          ? approverComments
          : fallbackComments;
      },
      {
        id: "comments",
        header: "Approver Comments",
        meta: { className: "w-50 max-w-xs whitespace-pre-wrap break-words" },
        cell: (info) => {
          const comments = info.getValue();
          if (
            comments &&
            typeof comments === "object" &&
            comments?.length > 0
          ) {
            return (
              <div className="space-y-1 overflow-y-auto max-h-30 ">
                {comments
                  .filter((c) => c?.comments)
                  .reverse()
                  .map((item, index) => (
                    <div key={`${item.role}-${index}`}>
                      <strong className="capitalize">
                        {item.role == "initlg" ? "Initiator" : item.role}:
                      </strong>{" "}
                      {item.comments}
                    </div>
                  ))}
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
    data: allstatements || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPageSize,
    pageCount: Math.ceil(receiptscount / pagination.pageSize),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="flex-grow w-full px-5">
      <div className="flex border-b  border-gray-300 mb-4">
        {[
          "All",
          "Approved",
          "Rejected",
          "Pending",
          "Under Review",
          "Approval History",
        ].map((tab) => {
          const isActive =
            (tab === "All" && statusfilter === "All") ||
            (tab === "Approved" && statusfilter === "Approved") ||
            (tab === "Rejected" && statusfilter === "Rejected") ||
            (tab === "Pending" && statusfilter === "Pending") ||
            (tab === "Under Review" && statusfilter === "Review") ||
            (tab === "Approval History" && statusfilter === "Approval History");

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
          } else if (tab === "Approval History") {
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
                    setStatusFilter("Review");
                    setPageIndex(0);
                    break;
                  case "Approval History":
                    setStatusFilter("Approval History");
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
        })}

        <div className="flex justify-between ml-auto">
          {isLogistics && (isPlant || isBuyvsrent) && (
            <div className="flex px-4 py-2 -mb-px items-center justify-center ml-auto">
              <DashboardButton />
            </div>
          )}

          <InputSearch
            handleSearch={handleSearch}
            search={search}
            setSearch={setSearch}
            setSearchCSNo={setSearchCSNo}
            setSearchCSName={setSearchCSName}
            module="lg"
          />
        </div>
      </div>
      {statusfilter !== "Approval History" && (
        <div
          className="overflow-y-auto  bg-white shadow rounded border border-gray-200"
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
                  <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center text-nowrap">
                    Created
                  </th>
                  <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center text-nowrap">
                    {userInfo?.is_admin ? "Last Activity" : "Submitted"}
                  </th>
                  <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center text-nowrap">
                    {" "}
                    Approvals History
                  </th>
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
                    className={`even:bg-white odd:bg-gray-50 hover:bg-blue-100   ${
                      row.original.deleted !== 0
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

                    <td className="border-gray-300 border-b px-4 py-2 text-sm text-gray-700 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <Link
                          className="px-2 py-1 bg-blue-500 text-white rounded inline-flex justify-center items-center gap-2 hover:bg-blue-600 cursor-pointer"
                          to={`/lstatements/${row.original?.id}`}
                        >
                          View <FaArrowCircleRight />
                        </Link>
                        <IoPrint
                          className={
                            userInfo?.is_admin ||
                            userInfo.role?.includes("incharge") ||
                            isgm
                              ? "text-black cursor-pointer"
                              : "text-gray-400 pointer-events-none cursor-not-allowed"
                          }
                          size={25}
                          onClick={async () => {
                            const { formData, tableData } = await getstatement(
                              row.original?.id,
                            );

                            handlePrint(formData, tableData, userInfo);
                          }}
                        />
                        <FaTrash
                          className={`mr-1 text-red-500  ${!userInfo?.is_admin ? "hidden" : row.original.status === "Approved" ? "cursor-not-allowed  opacity-50 scale-95" : "cursor-pointer"} `}
                          size={16}
                          onClick={() => {
                            if (row.original.status === "Approved") return;
                            // setdeleteMr(row.original.formData.id);
                            setDeleteStatement({
                              id: row.original.id,
                              open: true,
                            });
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
                            "logistics",
                          ) || ""}
                    </td>
                    <td className="border-gray-300 border-b px-4 py-2 text-sm text-gray-700 text-center">
                      <div
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          (handleApprovalHistory(row.original.id),
                            fetchPmName(row.original.project));
                        }}
                      >
                        <FaHistory />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className={`flex justify-between`}>
            <div className="ml-2 flex items-center text-sm text-gray-700 font-medium">
              Total Number of Records: {receiptscount}
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
                  <strong>
                    {receiptscount != 0 ? pagination.pageIndex + 1 : 0}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {Math.ceil(receiptscount / pagination.pageSize)}
                  </strong>
                </span>

                <button
                  onClick={() => setPageIndex(pagination.pageIndex + 1)}
                  disabled={
                    pagination.pageIndex + 1 >=
                    Math.ceil(receiptscount / pagination.pageSize)
                  }
                  className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${
                    pagination.pageIndex + 1 >=
                    Math.ceil(receiptscount / pagination.pageSize)
                      ? "cursor-auto"
                      : "cursor-pointer"
                  }`}
                >
                  Next ›
                </button>

                <button
                  onClick={() =>
                    setPageIndex(
                      Math.ceil(receiptscount / pagination.pageSize) - 1,
                    )
                  }
                  disabled={
                    pagination.pageIndex ==
                    Math.max(
                      Math.ceil(receiptscount / pagination.pageSize) - 1,
                      0,
                    )
                  }
                  className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${
                    pagination.pageIndex ==
                    Math.max(
                      Math.ceil(receiptscount / pagination.pageSize) - 1,
                      0,
                    )
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
      )}
      {statusfilter === "Approval History" && <ApprovalHistory />}

      {deletestatement.open && (
        <Alerts
          message="Are you sure you want to Delete the Selected statement?"
          onCancel={() => setDeleteStatement({ open: false })}
          onConfirm={() => {
            handleDelete(deletestatement.id);
          }}
        />
      )}

      {showtoast && !errormessage && userInfo?.is_admin && (
        <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
          <SiTicktick /> Statement Removed Successfully!
        </div>
      )}
      {showtoast && errormessage && (
        <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
          <MdOutlineErrorOutline /> {errormessage}
        </div>
      )}
      {errormessage && (
        <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
          <SiTicktick /> {errormessage}
        </div>
      )}
    </div>
  );
};

export default LogisticsDashboard;
