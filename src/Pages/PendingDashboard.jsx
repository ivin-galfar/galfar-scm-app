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
import { usePagination } from "../store/statementStore";
import useUserInfo from "../CustomHooks/useUserInfo";
import { Link } from "react-router-dom";
import { FaArrowCircleRight } from "react-icons/fa";
import {
  formatDateDMY,
  getPath,
  initiatorRoles,
} from "../Helpers/helperfunctions";
import { useClickFromDashboard } from "../store/helperStore";
import { transformAnalyticsData } from "../Components/analytics/transformAnalyticsData";
import { GetAnalyticsData } from "../APIs/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MdRestartAlt } from "react-icons/md";

const PendingDashboard = () => {
  const { pagination, setPageIndex, setPageSize } = usePagination();
  const { setIsClicked } = useClickFromDashboard();
  const [filtertype, setFilterType] = useState("");
  const userInfo = useUserInfo();
  const isAdmin = userInfo?.is_admin;
  const roles = userInfo?.role || [];
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-approvals", userInfo?.token],
    queryFn: () => GetAnalyticsData(userInfo),
    enabled: !!userInfo,
    select: transformAnalyticsData,
  });
  const pendingAnalyticsData = data?.pendingForYou.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const filteredItems = isAdmin
    ? pendingAnalyticsData?.filter((item) => {
        if (roles.includes("inith")) {
          return item.type === "hiring";
        }

        if (roles.includes("inita")) {
          return item.type === "asset" || item.type === "buyvsrent";
        }

        return false;
      })
    : pendingAnalyticsData;
  const columnHelper = createColumnHelper();
  const selectedFilteredItems = filteredItems?.filter((item) => {
    return !filtertype || item.label === filtertype;
  });
  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      meta: { className: "min-w-20  whitespace-pre-wrap break-words" },
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor((row) => row?.doc_no, {
      id: "doc_id",
      meta: { className: "w-50  whitespace-pre-wrap break-words" },
      header: "Doc. No.",
      cell: (info) => {
        const value = info.row.original;
        let formatted_doc = "";
        let category = "";
        if (value?.label == "Asset CS" || value?.label == "Hiring CS") {
          formatted_doc = value.doc_no;
        } else if (value.label == "Logistics CS") {
          category = "Logistics ";
          formatted_doc = value.id;
        } else if (value.label == "Buy Vs Rent") {
          category = "BVR ";
          formatted_doc = value.id;
        } else if (value.label == "File Note" || value.label == "IOC") {
          formatted_doc = value.id;
          category = value.category;
        }

        return `${category ? category + "/" : ""}${formatted_doc} `;
      },
    }),
    columnHelper.accessor((row) => row?.name, {
      id: "subject",
      header: "Subject",
      meta: { className: "max-w-70  whitespace-pre-wrap break-words" },
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.label, {
      id: "Type",
      header: "Type of Doc.",
      meta: { className: "max-w-70  whitespace-pre-wrap break-words" },
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.created_at, {
      id: "created",
      header: "Created At",
      meta: { className: "max-w-70  whitespace-pre-wrap break-words" },
      cell: (info) => {
        const created = formatDateDMY(info.getValue());
        return created;
      },
    }),
  ];
  const total = selectedFilteredItems?.length || 0;

  const startIndex = pagination.pageIndex * pagination.pageSize;

  const paginatedData = (selectedFilteredItems || []).slice(
    startIndex,
    startIndex + pagination.pageSize,
  );
  const table = useTable({
    data: paginatedData || [],
    columns,
  });

  const unique_labels = [...new Set(filteredItems?.map((t) => t.label))];

  return (
    <main className="min-w-0 min-h-0 flex-1 overflow-x-hidden bg-gradient-to-br from-muted/50 via-background to-muted/20 px-3 py-4 sm:px-5 lg:h-full lg:px-6 lg:py-3">
      <section className=" rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {initiatorRoles.some((r) => userInfo.role.includes(r)) ||
              userInfo.role.every((role) => role === "initfn")
                ? "Pending Statements"
                : "Awaiting for your Action"}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {initiatorRoles.some((r) => userInfo.role.includes(r)) ||
              userInfo.role.every((role) => role === "initfn")
                ? "Statments which are still in progress"
                : "Requests that require your attention"}
            </p>
          </div>
          <div className="flex  justify-center items-center gap-2">
            {unique_labels.length > 1 && (
              <select
                value={filtertype}
                className="w-60 appearance-none rounded-lg border-2 border-gray-300 px-5 py-2.5 text-sm font-medium
                text-gray-800 bg-white shadow-md cursor-pointer
                hover:border-blue-400 hover:shadow-lg transition-all duration-200
                focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
                bg-no-repeat bg-right pr-12"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%231F2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.9rem center",
                }}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPageIndex(0);
                }}
              >
                <option value="">📋 All type of Doc.</option>
                {unique_labels.map((label) => {
                  return <option key={label}>{label}</option>;
                })}
              </select>
            )}
            {filtertype && (
              <button
                type="button"
                aria-label="Clear document filter"
                title="Clear document filter"
                onClick={() => {
                  setFilterType("");
                  setPageIndex(0);
                }}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
              >
                <MdRestartAlt size={30} aria-hidden="true" />
              </button>
            )}
          </div>
        </header>

        <div className="flex-grow ">
          <div className="flex-grow w-full">
            <div className="flex border-b justify-between items-center border-gray-300 mb-4">
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
                        {userInfo?.is_admin ? "Last Activity" : "Submitted"}
                      </th>
                      {/* <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center"></th>
                      <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center"></th> */}
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
                          row.original?.deleted
                            ? row.original?.deleted != 0
                              ? "bg-red-50 text-red-400 border-l-4 border-red-400/60 opacity-60 grayscale"
                              : ""
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
                        <td className="border-gray-300 border-b px-2 py-2 text-sm text-gray-700 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <Link
                              className="px-2 py-1 bg-blue-500 text-white rounded inline-flex justify-center items-center gap-2 hover:bg-blue-600 cursor-pointer"
                              // onClick={() => setNewfn(false)}
                              to={`/${getPath(row.original.label)}/${row.original.id}`}
                              onClick={setIsClicked}
                            >
                              View <FaArrowCircleRight />
                            </Link>
                          </div>
                        </td>
                        <td className="border-gray-300 border-b px-2 py-2 text-sm text-gray-700 text-center">
                          {formatDateDMY(row.original.lastActivity)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={`flex justify-between p-2`}>
          <div className="ml-2 flex items-center text-sm text-gray-700 font-medium">
            Total Number of Records: {selectedFilteredItems?.length}
          </div>

          <div className="flex items-center gap-2 ">
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
              Page <strong>{total != 0 ? pagination.pageIndex + 1 : 0}</strong>{" "}
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
      </section>
    </main>
  );
};

export default PendingDashboard;
