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
  useTable,
} from "@tanstack/react-table";
import {
  createExpandedRowModel,
  createPaginatedRowModel,
  rowExpandingFeature,
  rowPaginationFeature,
  tableFeatures,
} from "@tanstack/table-core";
import {
  useDashboardType,
  useHistoryData,
  useIdHistory,
  useMultiStatusFilter,
  usePmName,
  useSelectedProject,
  useStatusFilter,
} from "../store/logisticsStore";
import { IoWarningOutline } from "react-icons/io5";
import { LuEye, LuFileDown, LuTrash2, LuWorkflow } from "react-icons/lu";
import DashboardButton from "../Components/DashboardButton";
import { getDashboardStatusTabClass } from "../Helpers/dashboardStatusNav";
import DashboardStatusNav from "../Components/DashboardStatusNav";
import {
  is_buyrent,
  is_gm,
  is_logistics,
  is_plant,
} from "../Helpers/dept_helper";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Alerts from "../Components/Alerts";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { SiTicktick } from "react-icons/si";
import { MdOutlineErrorOutline } from "react-icons/md";
import { handlePrint } from "../Helpers/print_helper";
import ApprovalHistory from "../Components/ApprovalHistory";
import { usePagination, usetotalReceipts } from "../store/statementStore";
import {
  formatDateDDMMYYYY,
  getlastSubmittedDate,
  getSubmittedDate,
} from "../Helpers/helperfunctions";
import InputSearch from "../Components/InputSearch";
import Loading from "../Components/Loading";
import { GrAttachment } from "react-icons/gr";
import { useClickFromDashboard } from "../store/helperStore";
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
  const { resetIsClicked } = useClickFromDashboard();

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
      queryClient.invalidateQueries({ queryKey: ["csid"] });
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
        resetIsClicked();
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
      meta: {
        className: "w-12 whitespace-nowrap text-center !px-1",
      },
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor((row) => row?.id, {
      id: "csno",
      header: "Document No.",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.shipment_no, {
      id: "shipment",
      header: "Shipment No.",
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
          row.comment_init && { role: "initlg", comments: row.comment_init },
        ].filter(Boolean);

        return approverComments.length > 0
          ? approverComments
          : fallbackComments;
      },
      {
        id: "comments",
        header: "Approver Comments",
        meta: { className: "w-48 max-w-xs whitespace-pre-wrap break-words" },
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
  const tableFeaturesConfig = tableFeatures({
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
    rowExpandingFeature,
    expandedRowModel: createExpandedRowModel(),
  });

  const table = useTable({
    data: allstatements || [],
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
    pageCount: Math.ceil(receiptscount / pagination.pageSize),
  });

  return (
    <main className="dashboard-shell relative flex h-0 min-h-0 w-full flex-grow flex-col overflow-hidden bg-slate-50 px-2 pb-0 pt-2 sm:px-3">
      <div className="mb-3 flex shrink-0 flex-col gap-2 rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-[0_1px_2px_rgb(15_23_42/0.04)] sm:p-2 lg:flex-row lg:items-center lg:justify-between">
        <DashboardStatusNav>
          {["All", "Approved", "Rejected", "Pending", "Under Review"].map(
            (tab) => {
              const isActive =
                (tab === "All" && statusfilter === "All") ||
                (tab === "Approved" && statusfilter === "Approved") ||
                (tab === "Rejected" && statusfilter === "Rejected") ||
                (tab === "Pending" && statusfilter === "Pending") ||
                (tab === "Under Review" && statusfilter === "Review");

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
                  className={getDashboardStatusTabClass(tab, isActive)}
                >
                  {tab}
                </button>
              );
            },
          )}
        </DashboardStatusNav>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          {isLogistics && (isPlant || isBuyvsrent) && (
            <div className="flex items-center">
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
        <div className="min-h-0 flex-1 overflow-auto rounded border border-gray-200 bg-white shadow [scrollbar-width:thin]">
          <Loading isLoading={isLoading} />
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="top-0 z-10 sticky  bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap border-b border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700"
                    >
                      {header.isPlaceholder
                        ? null
                        : header.column.columnDef.header}
                    </th>
                  ))}
                  <th className="whitespace-nowrap border-b border-gray-300 px-2 py-2 text-center text-sm font-semibold text-gray-700">
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
                    Timelines
                  </th>
                  <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center text-nowrap"></th>
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
                      row.original.deleted !== 0
                        ? "!bg-red-50 text-red-400 border-l-4 border-red-400/60 opacity-60 grayscale"
                        : ""
                    }`}
                  >
                    {(row.getVisibleCells?.() ?? row.getAllCells()).map(
                      (cell) => (
                        <td
                          key={cell.id}
                          className={`border-b  border-gray-300 px-4 py-2 text-sm text-gray-700 ${cell.column.columnDef.meta?.className || ""}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ),
                    )}

                    <td className="whitespace-nowrap border-b border-gray-300 px-2 py-2 text-center text-sm text-gray-700">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                          to={`/lstatements/${row.original?.id}`}
                        >
                          <LuEye size={14} /> View
                        </Link>
                        <button
                          type="button"
                          disabled={
                            !(
                              userInfo?.is_admin ||
                              userInfo.role?.includes("incharge") ||
                              isgm
                            )
                          }
                          className={`inline-flex h-7 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border px-1.5 text-xs font-semibold transition ${
                            userInfo?.is_admin ||
                            userInfo.role?.includes("incharge") ||
                            isgm
                              ? "cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          }`}
                          onClick={async () => {
                            const { formData, tableData } = await getstatement(
                              row.original?.id,
                            );

                            handlePrint(formData, tableData, userInfo);
                          }}
                        >
                          <LuFileDown size={14} /> PDF
                        </button>
                        {userInfo?.is_admin && (
                          <button
                            type="button"
                            className={`flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 transition hover:border-red-300 hover:bg-red-100 ${!userInfo?.is_admin ? "hidden" : row.original.status === "Approved" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                            aria-label="Delete statement"
                            title="Delete statement"
                            onClick={() => {
                              if (row.original.status === "Approved") return;
                              // setdeleteMr(row.original.formData.id);
                              setDeleteStatement({
                                id: row.original.id,
                                open: true,
                              });
                            }}
                          >
                            <LuTrash2 size={14} />
                          </button>
                        )}
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
                      <button
                        type="button"
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-blue-700 transition hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label="View approval timeline"
                        title="View approval timeline"
                        onClick={() => {
                          (handleApprovalHistory(row.original.id),
                            fetchPmName(row.original.project));
                        }}
                      >
                        <LuWorkflow size={17} aria-hidden="true" />
                      </button>
                    </td>
                    <td className="border-gray-300 border-b text-sm text-gray-700 text-center">
                      {row.original.filename?.length > 0 && (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <GrAttachment size={12} />
                          <span>{row.original.filename.length}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-1 py-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center text-sm font-semibold text-slate-600">
              Total Number of Records: {receiptscount}
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
                  className={`h-6 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 motion-reduce:transition-none ${
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
                  className={`h-6 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 motion-reduce:transition-none ${
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
      {statusfilter === "Approval History" && (
        <div className="min-h-0 flex-1 overflow-auto [scrollbar-width:thin]">
          <ApprovalHistory />
        </div>
      )}

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
    </main>
  );
};

export default LogisticsDashboard;
