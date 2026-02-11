import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { fetchbrstatements, fetchbrstatementscount } from "../APIs/api";
import { Link, useLocation } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useStatusFilter } from "../store/logisticsStore";
import {
  is_asset,
  is_buyvsrent,
  is_logistics,
  is_plant,
} from "../Helpers/dept_helper";
import { FaArrowAltCircleRight, FaTrash } from "react-icons/fa";
import DashboardButton from "../Components/DashboardButton";
import { useNewStatement, usetotalBRstatements } from "../store/brStore";
import { usePagination } from "../store/statementStore";
import { useEffect, useState } from "react";

const BRDashboards = () => {
  const location = useLocation();
  const userinfo = useUserInfo();
  const isPlant = is_plant(userinfo?.dept_code);
  const isLogistics = is_logistics(userinfo?.dept_code);
  const isasset = is_asset(userinfo?.role);
  const isbuyvsrent = is_buyvsrent(userinfo?.role);

  const { resetNewStatement } = useNewStatement();
  const { pagination, setPageIndex, setPageSize } = usePagination();
  const [searchcs, setSearchCS] = useState("");

  const { setStatusFilter, statusfilter, resetStatusFilter } =
    useStatusFilter();
  const { brcount, setBRCount } = usetotalBRstatements();

  const { data: brstatements } = useQuery({
    queryKey: [
      "csid",
      statusfilter,
      pagination.pageSize,
      pagination.pageIndex,
      searchcs,
    ],
    queryFn: () =>
      fetchbrstatements({
        userinfo,
        statusfilter,
        searchcs,
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        module: location.pathname,
      }),
    enabled: !!userinfo,
    keepPreviousData: true,
  });
  // useEffect(() => {
  //   const fetchStatments = async () => {
  //     try {

  //     } catch (error) {
  //       const message = error?.response?.data?.message || error.message;
  //       console.error("Fetch receipts error:", message);
  //     }
  //   };
  //   fetchStatments();
  // }, [statusfilter, searchcs]);
  const handleSearch = (e) => {
    setPageIndex(0);
    (setSearchCS(e.target.value), setStatusFilter("All"));
  };

  useEffect(() => {
    const fetchStatments = async () => {
      try {
        const totalcount = await fetchbrstatementscount(
          userinfo,
          statusfilter,
          searchcs,
          pagination.pageIndex,
          pagination.pageSize,
        );
        setBRCount(totalcount.total);
      } catch (error) {
        const message = error?.response?.data?.message || error.message;
        console.error("Fetch receipts error:", message);
      }
    };
    fetchStatments();
  }, [statusfilter, searchcs]);

  const columnHelper = createColumnHelper();
  const statusProgress = {
    "Pending For Hod": 20,
    "Pending For Fm": 40,
    "Pending For Gm": 60,
    "Pending For Ceo": 80,
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
      header: "Cs No.",
      cell: (info) => info.getValue() || "-",
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
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase(),
          )
          .join(" ");

        const progress = statusProgress[formattedstatus] || 0;

        const progressColor =
          formattedstatus === "Rejected"
            ? "bg-red-500"
            : formattedstatus === "Approved"
              ? "bg-green-500"
              : formattedstatus === "review"
                ? "bg-amber-500"
                : formattedstatus === "Pending For Hod"
                  ? "bg-yellow-400"
                  : formattedstatus === "Pending For Fm"
                    ? "bg-indigo-400"
                    : formattedstatus === "Pending For Gm"
                      ? "bg-amber-500"
                      : formattedstatus === "Pending For Ceo"
                        ? "bg-violet-600"
                        : "bg-gray-400";

        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 flex gap-2 items-center">
              {formattedstatus === "Review" ? (
                <>
                  <IoWarningOutline className="text-yellow-500" size={18} />
                  <span>To be Reviewed</span>
                </>
              ) : (
                formattedstatus || "Not Sent For Approval"
              )}
            </span>

            <div className="relative max-w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner cursor-pointer">
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
        console.log(Object.entries(comments));

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
                {Object.entries(comments).map(([key, value]) => (
                  <div key={key}>
                    <strong className="capitalize">{key}:</strong>{" "}
                    {value.comment}
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
    data: brstatements || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPageSize,
    pageCount: Math.ceil(brcount / pagination.pageSize),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="flex-grow ">
      <div className="flex-grow w-full px-5">
        <div className="flex border-b  border-gray-300 mb-4">
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

          <div className="flex justify-between ml-auto">
            {(isLogistics || isbuyvsrent) && isPlant && (
              <div className="flex px-4 py-2 -mb-px items-center justify-center ml-auto">
                <DashboardButton />
              </div>
            )}
            <div className="mb-1 ml-auto">
              <label className="  ml-auto text-sm font-medium text-gray-700 ">
                CS Number:
              </label>
              <input
                type="text"
                name="search"
                className="border  h-8 flex border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        {
          <div
            className="overflow-y-auto  bg-white shadow rounded border border-gray-200"
            style={{ height: `calc(93vh - 140px)` }}
          >
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
                      Created On
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
                      className="even:bg-white odd:bg-gray-50 hover:bg-blue-100 "
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
                            to={`/brstatement/${row.original?.id}`}
                            onClick={resetNewStatement}
                          >
                            View <FaArrowAltCircleRight />
                          </Link>
                          {/* <IoPrint
                            className={
                              userinfo?.is_admin || userinfo.role === "incharge"
                                ? "text-black cursor-pointer"
                                : "text-gray-400 pointer-events-none cursor-not-allowed"
                            }
                            size={25}
                            onClick={async () => {
                              const { formData, tableData } =
                                await getstatement(row.original?.id);

                              handlePrint(formData, tableData);
                            }}
                          /> */}
                          <FaTrash
                            className={`mr-1 text-red-500  ${!userinfo?.is_admin ? "hidden" : row.original.status === "Approved" ? "cursor-not-allowed  opacity-50 scale-95" : "cursor-pointer"} `}
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
                        {row.original.created_at
                          ? new Date(
                              row.original.created_at,
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className={`flex justify-between`}>
              <div className="ml-2 flex items-center text-sm text-gray-700 font-medium">
                Total Number of Records: {brcount}
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
                    className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${
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
                    className={`border border-gray-300 rounded px-3 py-1 text-sm disabled:opacity-40 ${
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

        {/* {deletestatement.open && (
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
            <MdOutlineErrorOutline /> {errormessage}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default BRDashboards;
