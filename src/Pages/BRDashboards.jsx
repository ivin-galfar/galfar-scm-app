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
import {
  fetchbrstatement,
  fetchbrstatements,
  fetchbrstatementscount,
} from "../APIs/api";
import { Link, useLocation } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useStatusFilter } from "../store/logisticsStore";
import {
  is_asset,
  is_buyrent,
  is_gm,
  is_hod,
  is_logistics,
  is_plant,
} from "../Helpers/dept_helper";
import DashboardButton from "../Components/DashboardButton";
import { getDashboardStatusTabClass } from "../Helpers/dashboardStatusNav";
import DashboardStatusNav from "../Components/DashboardStatusNav";
import { useNewStatement, usetotalBRstatements } from "../store/brStore";
import { usePagination } from "../store/statementStore";
import { useEffect, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { LuEye, LuFileDown, LuTrash2 } from "react-icons/lu";
import Alerts from "../Components/Alerts";
import { REACT_SERVER_URL } from "../../config/ENV";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import axios from "axios";
import { SiTicktick } from "react-icons/si";
import { MdOutlineError } from "react-icons/md";
import { handleBrPrint, handlePrint } from "../Helpers/print_helper";
import {
  formatDateDDMMYYYY,
  getlastSubmittedDate,
  getSubmittedDate,
} from "../Helpers/helperfunctions";
import InputSearch from "../Components/InputSearch";
import Loading from "../Components/Loading";
import { useClickFromDashboard } from "../store/helperStore";

const BRDashboards = () => {
  const location = useLocation();
  const userinfo = useUserInfo();
  const isPlant = is_plant(userinfo?.dept_code);
  const isLogistics = is_logistics(userinfo?.dept_code);
  const isasset = is_asset(userinfo?.role);
  const ishod = is_hod(userinfo?.role);
  const isBuyvsrent = is_buyrent(userinfo?.dept_code);
  const isgm = is_gm(userinfo?.role);
  const [deletestatement, setDeleteStatement] = useState({
    id: null,
    open: false,
  });
  const { errormessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();
  const { resetIsClicked } = useClickFromDashboard();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { resetNewStatement } = useNewStatement();
  const { pagination, setPageIndex, setPageSize } = usePagination();
  const [searchcsno, setSearchCSNo] = useState(null);
  const [searchcsname, setSearchCSName] = useState(null);
  const [search, setSearch] = useState({
    isNumber: false,
    isText: true,
    value: null,
  });
  const queryClient = useQueryClient();

  const { setStatusFilter, statusfilter, resetStatusFilter } =
    useStatusFilter();
  const { brcount, setBRCount } = usetotalBRstatements();
  const canFetch = !!userinfo && isBuyvsrent;

  const { data: brstatements, isLoading } = useQuery({
    queryKey: [
      "csid",
      statusfilter,
      pagination.pageSize,
      pagination.pageIndex,
      searchcsno,
      searchcsname,
    ],
    queryFn: () =>
      fetchbrstatements({
        userinfo,
        statusfilter,
        searchcsno,
        searchcsname,
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        module: location.pathname,
      }),
    enabled: canFetch,
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
      value: e.target.value,
    }));
    setPageIndex(0);
  };

  const handleDelete = async (id) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userinfo.token}`,
        },
      };
      await axios.post(
        `${REACT_SERVER_URL}/brstatement/delete/${id}`,
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

  const getstatement = async (cs_id) => {
    try {
      let response = await fetchbrstatement(cs_id, userinfo);

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
        const totalcount = await fetchbrstatementscount(
          userinfo,
          statusfilter,
          searchcsno,
          searchcsname,
          pagination.pageIndex,
          pagination.pageSize,
        );
        setBRCount(totalcount.total);
      } catch (error) {
        const message = error?.response?.data?.message || error.message;
        console.error("Fetch receipts error:", message);
      }
    };
    resetIsClicked();
    if (canFetch) {
      fetchStatments();
    }
  }, [statusfilter, searchcsno, searchcsname, , canFetch]);

  const columnHelper = createColumnHelper();
  const statusProgress = {
    "Pending For HOD": 20,
    "Pending For FM": 40,
    "Pending For GM": 60,
    "Pending For CEO": 80,
    Approved: 100,
    Rejected: 100,
    "": 0,
  };

  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor((row) => row?.id, {
      id: "cs_no",
      header: "Doc. No.",
      cell: (info) => "BVR - " + info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.item, {
      id: "item",
      header: "Item",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.chosentype, {
      id: "chosentype",
      header: "Preferred Type",
      cell: (info) => info.getValue() || "-",
    }),

    columnHelper.accessor((row) => row?.status, {
      id: "status",
      header: "Status",
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
        const progress = statusProgress[formattedstatus] || 0;
        const rowData = info.row.original;
        const isDeleted = rowData.deleted;
        const displayStatus = isDeleted ? "Deleted" : formattedstatus;

        const progressColor =
          formattedstatus === "Rejected"
            ? "bg-red-500"
            : formattedstatus === "Approved"
              ? "bg-green-500"
              : formattedstatus === "review"
                ? "bg-amber-500"
                : formattedstatus === "Pending For HOD"
                  ? "bg-yellow-400"
                  : formattedstatus === "Pending For FM"
                    ? "bg-indigo-400"
                    : formattedstatus === "Pending For GM"
                      ? "bg-amber-500"
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
        header: "Approver Comments",
        meta: { className: "w-50 max-w-xs whitespace-pre-wrap break-words" },
        cell: (info) => {
          const comments = info.getValue();
          if (
            comments &&
            typeof comments === "object" &&
            Object.keys(comments).length > 0
          ) {
            return (
              <div className="space-y-1 overflow-y-auto max-h-30 ">
                {Object.entries(comments)
                  .reverse()
                  .map(([key, value]) =>
                    value.comment?.trim() ? (
                      <div key={key}>
                        {value.comment !== "" && (
                          <>
                            <strong className="capitalize">
                              {value.role != "inita"
                                ? value.role + ":"
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
  const tableFeaturesConfig = tableFeatures({
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
    rowExpandingFeature,
    expandedRowModel: createExpandedRowModel(),
  });

  const table = useTable({
    data: brstatements?.rows || [],
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
    pageCount: Math.ceil(brcount / pagination.pageSize),
  });

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

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
            {(isLogistics || isasset || ishod) && (isPlant || isBuyvsrent) && (
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
              module="br"
            />
          </div>
        </div>
        {
          <div className="min-h-0 flex-1 overflow-y-auto rounded border border-gray-200 bg-white shadow">
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
                      {userinfo?.is_admin ? "Last Activity" : "Submitted"}
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

                      <td className="border-gray-300 border-b px-4 py-2 text-sm text-gray-700 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                            to={`/brstatement/${row.original?.id}`}
                            onClick={resetNewStatement}
                          >
                            <LuEye size={14} /> View
                          </Link>
                          <button
                            type="button"
                            disabled={
                              !(
                                userinfo?.is_admin ||
                                userinfo.role?.includes("inita") ||
                                isgm ||
                                ishod
                              )
                            }
                            className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-semibold transition ${
                              userinfo?.is_admin ||
                              userinfo.role?.includes("inita") ||
                              isgm ||
                              ishod
                                ? "cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            }`}
                            onClick={async () => {
                              const formData = await getstatement(
                                row.original?.id,
                              );
                              handleBrPrint(formData);
                            }}
                          >
                            <LuFileDown size={14} /> PDF
                          </button>
                          <button
                            type="button"
                            className={`inline-flex h-7 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 ${!userinfo?.is_admin ? "hidden" : row.original.status === "approved" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                            aria-label="Delete statement"
                            onClick={() => {
                              if (row.original.status === "approved") return;
                              setDeleteStatement({
                                id: row.original.id,
                                open: true,
                              });
                            }}
                          >
                            <LuTrash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>

                      <td className="border-gray-300 border-b px-4 py-2 text-sm text-gray-700 text-center">
                        {formatDateDDMMYYYY(row.original.created_at)}
                      </td>
                      <td className="border-gray-300 border-b px-4 py-2 text-[13px] text-gray-700 text-center w-32">
                        {userinfo?.is_admin
                          ? getlastSubmittedDate(
                              row?.original?.approver_info,
                              userinfo?.role[0],
                            ) || ""
                          : getSubmittedDate(
                              row?.original?.approver_info,
                              userinfo?.role[0],
                              "bvr",
                            ) || ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-1 py-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center text-sm font-semibold text-slate-600">
                Total Number of Records: {brcount}
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
                      {brcount != 0 ? pagination.pageIndex + 1 : 0}
                    </strong>{" "}
                    of{" "}
                    <strong>{Math.ceil(brcount / pagination.pageSize)}</strong>
                  </span>

                  <button
                    onClick={() => setPageIndex(pagination.pageIndex + 1)}
                    disabled={
                      pagination.pageIndex + 1 >=
                      Math.ceil(brcount / pagination.pageSize)
                    }
                    className={`h-6 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 motion-reduce:transition-none ${
                      pagination.pageIndex + 1 >=
                      Math.ceil(brcount / pagination.pageSize)
                        ? "cursor-auto"
                        : "cursor-pointer"
                    }`}
                  >
                    Next ›
                  </button>

                  <button
                    onClick={() =>
                      setPageIndex(Math.ceil(brcount / pagination.pageSize) - 1)
                    }
                    disabled={
                      pagination.pageIndex ==
                      Math.max(Math.ceil(brcount / pagination.pageSize) - 1, 0)
                    }
                    className={`h-6 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 motion-reduce:transition-none ${
                      pagination.pageIndex ==
                      Math.max(Math.ceil(brcount / pagination.pageSize) - 1, 0)
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

        {deletestatement.open && (
          <Alerts
            message="Are you sure you want to Delete the Selected statement?"
            onCancel={() => setDeleteStatement({ open: false })}
            onConfirm={() => {
              handleDelete(deletestatement.id);
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

export default BRDashboards;
