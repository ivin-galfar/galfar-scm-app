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
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Components/Context";
import fetchStatments from "../APIs/StatementsApi";
import useUserInfo from "../CustomHooks/useUserInfo";
import { Link, useLocation, Navigate } from "react-router-dom";
import Alerts from "../Components/Alerts";
import { REACT_SERVER_URL } from "../../config/ENV";
import axios from "axios";
import { IoWarningOutline } from "react-icons/io5";
import { LuEye, LuFileDown, LuTrash2 } from "react-icons/lu";
import { useToggleAsset } from "../store/assetStore";
import {
  useDeleteStatement,
  usePagination,
  usetotalReceipts,
} from "../store/statementStore";
import { useDashboardType } from "../store/logisticsStore";
import DashboardButton from "../Components/DashboardButton";
import {
  is_asset,
  is_logistics,
  is_plant,
  is_fm,
  is_hod,
  is_gm,
  is_hire,
} from "../Helpers/dept_helper";
import { fetchReceiptCount } from "../APIs/api";
import { formatDateDDMMYYYY } from "../Helpers/helperfunctions";
import InputSearch from "../Components/InputSearch";
import Loading from "../Components/Loading";
import {
  useClickFromDashboard,
  useLoading,
  useQuickAccess,
} from "../store/helperStore";
import { handleHirePrint } from "../Helpers/print_helper";
const Dashboard = () => {
  const {
    receipts,
    setReqMrno,
    setReceipts,
    setMrno,
    setAllReceipts,
    statusFilter,
    setStatusFilter,
    multiStatusFilter,
    setMultiStatusFilter,
  } = useContext(AppContext);
  const { toggleasset, resetasset } = useToggleAsset();
  const [approversFetched, setApproversFetched] = useState(false);
  const { deleted, resetDeleted, setDeleted } = useDeleteStatement();
  const { isClicked, setIsClicked } = useQuickAccess();
  const userInfo = useUserInfo();
  const { dashboardType, setDashboardType, resetDashboardType } =
    useDashboardType();
  const { resetIsClicked } = useClickFromDashboard();
  const { pagination, setPageIndex, setPageSize } = usePagination();
  const [searchcsno, setSearchCSNo] = useState(null);
  const [searchcsname, setSearchCSName] = useState(null);
  const [search, setSearch] = useState({
    isNumber: false,
    isText: true,
    value: null,
  });
  const ishire = is_hire(userInfo?.role);
  const isLogistics = is_logistics(userInfo?.dept_code);
  const isasset = is_asset(userInfo?.role);
  const ishod = is_hod(userInfo?.role);
  const isfm = is_fm(userInfo?.role);
  const isgm = is_gm(userInfo?.role);
  const location = useLocation();
  const { receiptscount, setReceiptsCount } = usetotalReceipts();
  const isPlant = is_plant(userInfo?.dept_code);
  const statusProgress = {
    "Pending For HOD": 20,
    "Pending for GM": 40,
    "Pending for CEO": 60,
    Approved: 100,
    Rejected: 100,
    "": 0,
  };

  const statusMapping = {
    inita: [
      "Pending for HOD",
      "Pending for GM",
      "Pending for CEO",
      "Approved",
      "Rejected",
      "review",
      "reverted",
      "",
    ],
    inith: [
      "Pending for HOD",
      "Pending for GM",
      "Pending for CEO",
      "Approved",
      "Rejected",
      "review",
      "reverted",
      "",
    ],

    hod: [
      "Pending For HOD",
      "Pending For GM",
      "Pending For CEO",
      "review",
      "Rejected",
      "Approved",
    ],
    gm: [
      "Pending For HOD",
      "Pending for GM",
      "Pending for CEO",
      "review",
      "Approved",
      "Rejected",
    ],
    ceo: [
      "Pending For HOD",
      "Pending for GM",
      "Pending for CEO",
      "review",
      "Approved",
      "Rejected",
    ],
  };

  const [triggerdelete, setTriggerdelete] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [deleteMr, setdeleteMr] = useState("");
  const { isLoading, setIsLoading, resetIsLoading } = useLoading();
  const expectedStatuses = (userInfo?.role || []).flatMap((role) =>
    (statusMapping[role.toLowerCase()] || []).map((s) => s.toLowerCase()),
  );

  const pendingStatuses = !userInfo?.is_admin
    ? expectedStatuses.filter(
        (s) =>
          s.startsWith("pending") && userInfo.role.some((r) => s.includes(r)),
      )
    : expectedStatuses.filter((s) => s.startsWith("pending"));

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setIsLoading();
        // FM users should not fetch receipts
        if (isfm) {
          setReceiptsCount(0);
          setAllReceipts([]);
          setReqMrno([]);
          setReceipts([]);
          setMrno([]);
          resetIsLoading();
          return;
        }

        const effectiveDashboardType =
          (ishire || isasset) && userInfo?.is_admin
            ? isClicked
              ? dashboardType
              : ishire
                ? "hiring"
                : "asset"
            : dashboardType;

        const { filteredReceipts, reqMrValues, categorizedReceipts, mrValues } =
          await fetchStatments({
            expectedStatuses,
            userInfo,
            module: location.pathname,
            page: pagination.pageIndex,
            limit: pagination.pageSize,
            status: statusFilter,
            multiStatus: multiStatusFilter,
            searchcsno: searchcsno,
            searchcsname: searchcsname,
            type: effectiveDashboardType,
          });

        const totalcount = await fetchReceiptCount({
          expectedStatuses,
          userInfo,
          status: statusFilter,
          multiStatus: multiStatusFilter,
          searchcsno: searchcsno,
          searchcsname: searchcsname,
          type: effectiveDashboardType,
        });

        setReceiptsCount(totalcount.receipts_count);
        setAllReceipts(filteredReceipts);
        setReqMrno(reqMrValues);
        setReceipts(categorizedReceipts);
        setMrno(mrValues);
        resetIsClicked();
        resetIsLoading();
      } catch (error) {
        const message = error?.response?.data?.message || error.message;
        console.error("Fetch receipts error:", message);
        resetIsLoading();
      }
    };

    fetchReceipts();
  }, [
    deleted,
    pagination.pageSize,
    pagination.pageIndex,
    statusFilter,
    multiStatusFilter,
    searchcsno,
    searchcsname,
    dashboardType,
  ]);

  const handleDelete = async (mr) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.post(
        `${REACT_SERVER_URL}/receipts/${mr}`,
        {},
        config,
      );
      setShowToast(true);
      setErrormessage("");
      setDeleted();
      setTriggerdelete(false);
      setTimeout(() => {
        setShowToast(false);
        resetDeleted();
      }, 1500);
    } catch (error) {
      resetDeleted();
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
    }
  };
  const handleSearch = (e) => {
    if (search.isNumber) {
      setSearchCSNo(e.target.value);
    } else {
      setSearchCSName(e.target.value);
    }
    (setStatusFilter("All"), setMultiStatusFilter([]));
    setSearch((prev) => ({
      ...prev,
      type: search.isNumber ? search.isNumber : search.isText,
      value: e.target.value,
    }));
    setPageIndex(0);
  };
  const hasproject = dashboardType === "hiring";
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      meta: { className: "w-20 max-w-xs " },
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor(
      (row) => {
        const doc = row?.formData?.doc_no;

        if (!doc) return null;

        return doc.replace("/P&E", "");
      },
      {
        id: "mrno",
        header: "Document No.",
        cell: (info) => info.getValue() || "-",
      },
    ),
    columnHelper.accessor((row) => row?.formData?.hiringname, {
      id: "hiring.name",
      header: "Subject",
      meta: { className: "w-70 max-w-xs whitespace-pre-wrap break-words" },
      cell: (info) => info.getValue() || "-",
    }),
    ...(hasproject
      ? [
          columnHelper.accessor((row) => row?.formData?.projectvalue, {
            id: "project.value",
            header: "Project",
            cell: (info) => info.getValue() || "-",
          }),
        ]
      : ""),

    columnHelper.accessor((row) => row?.formData?.qty, {
      id: "quantity",
      header: "Quantity",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.formData?.status, {
      id: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() || "";
        const rowData = info.row.original.formData || {};
        const approverDetails = rowData.approverdetails || [];
        const isDeleted = rowData.deleted;

        const rejectedby =
          approverDetails.length > 0 &&
          approverDetails
            .map((rej) => rej.rejectedby)
            .filter((r) => r && r.trim() !== "" && r !== null && r.length > 0)
            .filter((r) => r.length > 0);

        const progress = statusProgress[status] || 0;

        const progressColor =
          status === "Rejected"
            ? "bg-red-500"
            : status === "Approved"
              ? "bg-green-500"
              : status === "review"
                ? "bg-amber-500"
                : status === "Pending For HOD"
                  ? "bg-yellow-400"
                  : status === "Pending for GM"
                    ? "bg-amber-500"
                    : status === "Pending for CEO"
                      ? "bg-violet-600"
                      : "bg-gray-300";
        const displayStatus = isDeleted ? "Deleted" : status;
        return (
          <div className="flex min-w-40 flex-col gap-1.5">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              {displayStatus === "review" ? (
                <>
                  <IoWarningOutline className="text-amber-500" size={18} />
                  <span>To be Reviewed</span>
                </>
              ) : displayStatus === "Rejected" &&
                rejectedby &&
                typeof rejectedby === "string" ? (
                <span>{"Rejected By " + rejectedby.toUpperCase()}</span>
              ) : (
                <span>{displayStatus || "Not Sent For Approval"}</span>
              )}
            </span>

            <div className="relative h-1.5 w-full max-w-36 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
              <div
                className={`h-full ${progressColor} rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none`}
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
        const commentsArray = row?.formData.approverdetails
          ?.filter((item) => item.comments && item.comments.trim() !== "{}")
          ?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((item) => {
            return (
              <span key={item.id} className="block">
                <span className="font-bold ">
                  {item.role.toUpperCase() != "INITH" &&
                  item.role.toUpperCase() != "INITA"
                    ? item.role.toUpperCase()
                    : "Initiator"}
                </span>
                : {item.comments}
              </span>
            );
          });

        return commentsArray?.length > 0 ? commentsArray : "-";
      },
      {
        id: "comments",
        header: "Comments",
        meta: { className: "w-80 max-w-xs whitespace-pre-wrap break-words" },
        cell: (info) => (
          <div className="space-y-1 overflow-y-auto max-h-30 ">
            <span className="whitespace-pre-wrap">
              {info.getValue() || "-"}
            </span>
          </div>
        ),
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
    data: receipts || [],
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
      <section className="mb-3 shrink-0 rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-[0_1px_2px_rgb(15_23_42/0.04)] sm:p-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:thin]">
            <div className="flex min-w-max items-center gap-1 rounded-lg bg-slate-100/80 p-1">
              {["All", "Approved", "Rejected", "Pending", "Under Review"].map(
                (tab) => {
                  const isActive =
                    (tab === "All" && statusFilter === "All") ||
                    (tab === "Approved" && statusFilter === "Approved") ||
                    (tab === "Rejected" && statusFilter === "Rejected") ||
                    (tab === "Under Review" && statusFilter === "review") ||
                    (tab === "Pending" && multiStatusFilter.length > 0);

                  let activeColor =
                    "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/40 ring-1 ring-inset ring-blue-200/50";
                  let inactiveColor =
                    "text-slate-500 hover:bg-white/70 hover:text-slate-800";

                  if (tab === "Approved") {
                    activeColor =
                      "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/40 ring-1 ring-inset ring-emerald-200/50";
                    inactiveColor =
                      "text-slate-500 hover:bg-white/70 hover:text-emerald-700";
                  } else if (tab === "Rejected") {
                    activeColor =
                      "bg-rose-50 text-rose-700 shadow-sm shadow-rose-100/40 ring-1 ring-inset ring-rose-200/50";
                    inactiveColor =
                      "text-slate-500 hover:bg-white/70 hover:text-rose-700";
                  } else if (tab === "Pending") {
                    activeColor =
                      "bg-amber-50 text-amber-700 shadow-sm shadow-amber-100/40 ring-1 ring-inset ring-amber-200/50";
                    inactiveColor =
                      "text-slate-500 hover:bg-white/70 hover:text-amber-700";
                  } else if (tab === "Under Review") {
                    activeColor =
                      "bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-100/40 ring-1 ring-inset ring-cyan-200/50";
                    inactiveColor =
                      "text-slate-500 hover:bg-white/70 hover:text-cyan-700";
                  }

                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        switch (tab) {
                          case "All":
                            setStatusFilter("All");
                            setMultiStatusFilter([]);
                            setPageIndex(0);
                            break;
                          case "Approved":
                            setStatusFilter("Approved");
                            setMultiStatusFilter([]);
                            setPageIndex(0);
                            break;
                          case "Rejected":
                            setStatusFilter("Rejected");
                            setMultiStatusFilter([]);
                            setPageIndex(0);
                            break;
                          case "Pending":
                            setStatusFilter("");
                            setMultiStatusFilter(pendingStatuses);
                            setPageIndex(0);
                            break;
                          case "Under Review":
                            setStatusFilter("review");
                            setMultiStatusFilter([]);
                            setPageIndex(0);
                            break;
                        }
                      }}
                      className={`cursor-pointer rounded-md px-2.5 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none sm:px-3 ${
                        isActive ? activeColor : inactiveColor
                      }`}
                    >
                      {tab}
                    </button>
                  );
                },
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
            {(isLogistics || isasset || ishod) && isPlant && (
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
            />
          </div>
        </div>
      </section>
      <div
        className="relative min-h-0 flex-1 overflow-auto rounded-t-xl border border-b-0 border-slate-200 bg-white shadow-[0_8px_24px_-20px_rgb(15_23_42/0.24)]"
      >
        <Loading isLoading={isLoading} />
        <table className="min-w-[900px] w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-slate-200 px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.06em] text-slate-600"
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </th>
                ))}
                <th className="border-b border-slate-200 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.06em] text-slate-600">
                  Action
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.06em] text-slate-600">
                  Created
                </th>
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-12 text-center text-sm font-medium text-slate-500"
                >
                  No Statements found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`group odd:bg-gray-50 even:bg-white transition-colors duration-200 hover:bg-blue-50/70 motion-reduce:transition-none
                ${
                  row.original.formData.deleted !== 0
                    ? "!bg-rose-50/70 text-rose-400 opacity-60 grayscale"
                    : ""
                }`}
                >
                  {(row.getVisibleCells?.() ?? row.getAllCells()).map(
                    (cell) => (
                      <td
                        key={cell.id}
                        className={`border-b border-slate-100 px-3 py-2 text-sm leading-5 text-slate-700 ${cell.column.columnDef.meta?.className}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ),
                  )}
                  <td className="border-b border-slate-100 px-3 py-2 text-center text-sm text-slate-700">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                        to={`/receipts/${row.original?.formData?.id}`}
                        onClick={() => {
                          row.original.formData.type == "hiring"
                            ? resetasset()
                            : toggleasset();
                        }}
                      >
                        <LuEye size={14} /> View
                      </Link>
                      <button
                        type="button"
                        disabled={!userInfo?.is_admin && !isgm && !ishod}
                        className={`inline-flex h-7 min-w-[5.25rem] items-center justify-center gap-1 whitespace-nowrap rounded-md border px-2.5 text-xs font-semibold transition ${
                          !userInfo?.is_admin && !isgm && !ishod
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            : "cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          handleHirePrint(row.original, userInfo);
                        }}
                      >
                        <LuFileDown size={14} /> Print PDF
                      </button>
                      <button
                        type="button"
                        className={`inline-flex h-7 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 ${!userInfo?.is_admin ? "hidden" : row.original.formData.status === "Approved" ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                        aria-label="Delete statement"
                        onClick={() => {
                          if (row.original.formData.status === "Approved")
                            return;
                          setdeleteMr(row.original.formData.id);
                          setTriggerdelete(true);
                        }}
                      >
                        <LuTrash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2 text-center text-sm text-slate-600">
                    {formatDateDDMMYYYY(row.original.formData.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="sticky bottom-0 z-10 bg-slate-50 h-6">
            <tr>
              <td
                colSpan={columns.length + 2}
                className="border-t border-slate-200 px-1 py-1"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center text-sm font-semibold text-slate-600">
                    Total Number of Records: {receiptscount}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        Rows per page:
                      </span>
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
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {triggerdelete && (
        <Alerts
          message="Are you sure you want to Delete the Selected statement?"
          onCancel={() => setTriggerdelete(false)}
          onConfirm={() => handleDelete(deleteMr)}
        />
      )}
      {showToast && !errormessage && deleted && (
        <div className="animate-slide-in fixed left-1/2 top-5 z-[9999] -translate-x-1/2 rounded-lg border border-emerald-500 bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 motion-reduce:animate-none motion-reduce:transition-none">
          ✅ Statement successfully Deleted!!
        </div>
      )}
    </main>
  );
};

export default Dashboard;
