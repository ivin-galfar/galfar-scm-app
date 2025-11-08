import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import useUserInfo from "../CustomHooks/useUserInfo";
import { fetchallstatements, fetchStatement } from "../APIs/api";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  useDashboardType,
  useMultiStatusFilter,
  useStatusFilter,
} from "../store/logisticsStore";
import { IoPrint, IoWarningOutline } from "react-icons/io5";
import DashboardButton from "../Components/DashboardButton";
import { is_logistics, is_plant } from "../Helpers/dept_helper";
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
const LogisticsDashboard = () => {
  const userInfo = useUserInfo();
  const { setStatusFilter, statusfilter, resetStatusFilter } =
    useStatusFilter();
  const { showtoast, setShowToast, resetshowtoast } = useToast();

  const { dashboardType, setDashboardType } = useDashboardType();
  const isLogistics = is_logistics(userInfo?.dept_code);
  const [searchcs, setSearchCS] = useState("");
  const { errormessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();
  const queryClient = useQueryClient();
  const [deletestatement, setDeleteStatement] = useState({
    id: null,
    open: false,
  });
  const isPlant = is_plant(userInfo?.dept_code);

  const { data: allstatements } = useQuery({
    queryKey: ["csid"],
    queryFn: () => fetchallstatements(userInfo),
    enabled: !!userInfo,
  });

  const filteredStatements = useMemo(() => {
    if (!allstatements) return [];

    let filtered = allstatements;
    if (searchcs !== "") {
      filtered = allstatements.filter((statements) =>
        statements.id.toString().includes(searchcs)
      );
    }

    if (searchcs == "") {
      if (statusfilter === "Approved") {
        filtered = allstatements.filter(
          (statement) => statement.status === "approved"
        );
      } else if (statusfilter === "Pending") {
        if (!userInfo.is_admin) {
          filtered = allstatements.filter((statement) =>
            statement.status?.includes(userInfo?.role?.toLocaleLowerCase())
          );
        } else {
          filtered = allstatements.filter((statement) =>
            statement.status?.includes("pending")
          );
        }
      } else if (statusfilter === "Rejected") {
        filtered = allstatements.filter(
          (statement) => statement.status === "rejected"
        );
      }
    }
    return filtered;
  }, [allstatements, statusfilter, searchcs]);

  const handleSearch = (e) => {
    (setSearchCS(e.target.value), setStatusFilter("All"));
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
        config
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

  const columnHelper = createColumnHelper();
  const statusProgress = {
    "Pending For Incharge": 20,
    "Pending For Pm": 30,
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
    columnHelper.accessor((row) => row?.id, {
      id: "csno",
      header: "CS NO",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.shipment_no, {
      id: "shipment",
      header: "shipment No.",
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
              word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase()
          )
          .join(" ");

        const progress = statusProgress[formattedstatus] || 0;

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
                        : formattedstatus === "Pending For Ceo"
                          ? "bg-violet-500"
                          : "bg-gray-300";

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
        const comment_incharge = row.comment_in ?? "";
        const comment_pm = row.comment_pm ?? "";
        const comment_gm = row.comment_gm ?? "";

        const comment_fm = row.comment_fm ?? "";
        const comment_ceo = row.comment_ceo ?? "";

        const comments_group = {};
        if (comment_ceo !== "") {
          comments_group.ceo = comment_ceo;
        }
        if (comment_fm !== "") {
          comments_group.fm = comment_fm;
        }
        if (comment_gm !== "") {
          comments_group.gm = comment_gm;
        }
        if (comment_pm !== "") {
          comments_group.pm = comment_pm;
        }
        if (comment_incharge != "") {
          comments_group.incharge = comment_incharge;
        }
        let comments = comments_group;

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
              <div className="space-y-1  ">
                {Object.entries(comments).map(([key, value]) => (
                  <div key={key}>
                    <strong className="capitalize">{key}:</strong> {value}
                  </div>
                ))}
              </div>
            );
          } else {
            return "-";
          }
        },
      }
    ),
  ];
  const table = useReactTable({
    data: filteredStatements || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="flex-grow w-full px-5">
      <div className="flex border-b  border-gray-300 mb-4">
        {["All", "Approved", "Rejected", "Pending"].map((tab) => {
          if (tab == "Under Review" && !userInfo?.is_admin) return null;
          const isActive =
            (tab === "All" && statusfilter === "All") ||
            (tab === "Approved" && statusfilter === "Approved") ||
            (tab === "Rejected" && statusfilter === "Rejected") ||
            (tab === "Pending" && statusfilter === "Pending");

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
                    break;
                  case "Approved":
                    setStatusFilter("Approved");
                    break;
                  case "Rejected":
                    setStatusFilter("Rejected");
                    break;
                  case "Pending":
                    setStatusFilter("Pending");
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
          {isLogistics && isPlant && (
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
                      className={`border-b  border-gray-300 px-4 py-2 text-sm text-gray-700 ${cell.column.columnDef.meta?.className}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
                        className={` ${
                          !userInfo?.is_admin
                            ? "text-gray-400 pointer-events-none cursor-not-allowed"
                            : "text-black cursor-pointer"
                        }`}
                        size={25}
                        onClick={async () => {
                          const { formData, tableData } = await getstatement(
                            row.original?.id
                          );

                          handlePrint(formData, tableData);
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
                    {row.original.created_at
                      ? new Date(row.original.created_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
          <MdOutlineErrorOutline /> {errormessage}
        </div>
      )}
    </div>
  );
};

export default LogisticsDashboard;
