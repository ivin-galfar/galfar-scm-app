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
import { FaArrowAltCircleRight, FaTrash } from "react-icons/fa";
import Alerts from "../Components/Alerts";
import { REACT_SERVER_URL } from "../../config/ENV";
import axios from "axios";
import { IoPrint } from "react-icons/io5";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import galfarlogo from "../assets/Images/logo-new.png";
import { IoWarningOutline } from "react-icons/io5";
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
import {
  fetchReceipt,
  fetchReceiptCount,
  fetchStatement,
  loginUser,
} from "../APIs/api";
import { formatDateDDMMYYYY } from "../Helpers/helperfunctions";
import InputSearch from "../Components/InputSearch";
import Loading from "../Components/Loading";
import { useLoading, useQuickAccess } from "../store/helperStore";
import { useSelectedDept } from "../store/userStore";
import { handleHirePrint } from "../Helpers/print_helper";
const Dashboard = () => {
  const {
    receipts,
    setReqMrno,
    setReceipts,
    setMrno,
    setAllReceipts,
    allreceipts,
    statusFilter,
    setStatusFilter,
    multiStatusFilter,
    setMultiStatusFilter,
    sharedTableData,
    setApproverDetails,
  } = useContext(AppContext);
  const { toggleasset, resetasset } = useToggleAsset();
  const [approversFetched, setApproversFetched] = useState(false);
  const { deleted, resetDeleted, setDeleted } = useDeleteStatement();
  const { isClicked, setIsClicked } = useQuickAccess();
  const userInfo = useUserInfo();
  const { dashboardType, setDashboardType, resetDashboardType } =
    useDashboardType();
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
        header: "Doc. No.",
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
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 flex gap-2 items-center">
              {displayStatus === "review" ? (
                <>
                  <IoWarningOutline className="text-yellow-500" size={18} />
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

            <div className="relative max-w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-2 ${progressColor} rounded-full transition-all duration-500`}
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
    <div className="w-full px-5 flex-grow relative">
      <div className="flex border-b  border-gray-300 mb-4">
        {["All", "Approved", "Rejected", "Pending", "Under Review"].map(
          (tab) => {
            const isActive =
              (tab === "All" && statusFilter === "All") ||
              (tab === "Approved" && statusFilter === "Approved") ||
              (tab === "Rejected" && statusFilter === "Rejected") ||
              (tab === "Under Review" && statusFilter === "review") ||
              (tab === "Pending" && multiStatusFilter.length > 0);

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
                className={`px-4 py-2 -mb-px border-b-2 font-medium cursor-pointer transition-colors ${
                  isActive ? activeColor : inactiveColor
                }`}
              >
                {tab}
              </button>
            );
          },
        )}
        <div className="flex justify-between ml-auto">
          {(isLogistics || isasset || ishod) && isPlant && (
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
          />
        </div>
      </div>
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
                <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                  Action
                </th>
                <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                  Created
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
                  className={`even:bg-white odd:bg-gray-50 hover:bg-blue-100 transition duration-200
                ${
                  row.original.formData.deleted !== 0
                    ? "bg-red-50 text-red-400 border-l-4 border-red-400/60 opacity-60 grayscale"
                    : ""
                }`}
                >
                  {(row.getVisibleCells?.() ?? row.getAllCells()).map(
                    (cell) => (
                      <td
                        key={cell.id}
                        className={`border-b  border-gray-300 px-4 py-2 text-sm text-gray-700 ${cell.column.columnDef.meta?.className}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ),
                  )}
                  <td className="border-gray-300 border-b px-4 py-2 text-sm text-gray-700 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <Link
                        className={`px-2 py-1 bg-blue-500 text-white rounded inline-flex justify-center items-center gap-2 hover:bg-blue-600 `}
                        to={`/receipts/${row.original?.formData?.id}`}
                        onClick={() => {
                          row.original.formData.type == "hiring"
                            ? resetasset()
                            : toggleasset();
                        }}
                      >
                        View <FaArrowAltCircleRight />
                      </Link>
                      <IoPrint
                        className={` ${
                          !userInfo?.is_admin && !isgm && !ishod
                            ? "text-gray-400 pointer-events-none cursor-not-allowed"
                            : "text-black cursor-pointer"
                        }`}
                        size={25}
                        onClick={() => {
                          handleHirePrint(row.original, userInfo);
                        }}
                      />
                      <FaTrash
                        className={`mr-1 text-red-500  ${!userInfo?.is_admin ? "hidden" : row.original.formData.status === "Approved" ? "cursor-not-allowed  opacity-50 scale-95" : "cursor-pointer"} `}
                        size={16}
                        onClick={() => {
                          if (row.original.formData.status === "Approved")
                            return;
                          setdeleteMr(row.original.formData.id);
                          setTriggerdelete(true);
                        }}
                      />
                    </div>
                  </td>
                  <td className="border-gray-300 border-b px-4 py-2 text-sm text-gray-700 text-center">
                    {formatDateDDMMYYYY(row.original.formData.created_at)}
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
      {triggerdelete && (
        <Alerts
          message="Are you sure you want to Delete the Selected statement?"
          onCancel={() => setTriggerdelete(false)}
          onConfirm={() => handleDelete(deleteMr)}
        />
      )}
      {showToast && !errormessage && deleted && (
        <div className="z-[9999] fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Statement successfully Deleted!!
        </div>
      )}
    </div>
  );
};

export default Dashboard;
