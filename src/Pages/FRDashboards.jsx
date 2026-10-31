import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  useTable,
} from "@tanstack/react-table";
import {
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
} from "@tanstack/table-core";
import { Link } from "react-router-dom";
import {
  LuChevronLeft,
  LuChevronRight,
  LuEye,
  LuFileDown,
  LuFolderKanban,
  LuX,
  LuTrash2,
  LuTruck,
} from "react-icons/lu";
import { MdOutlineError } from "react-icons/md";
import { SiTicktick } from "react-icons/si";
import {
  fetchProjectDetails,
  GetFleetRequests,
  UpdateFleetRequestWorkflow,
} from "../APIs/api";
import Alerts from "../Components/Alerts";
import useUserInfo from "../CustomHooks/useUserInfo";
import { getFleetRequestAccess } from "../Helpers/fleetRequestPermissions";
import { formatDateDDMMYYYY, handleFrPrint } from "../Helpers/helperfunctions";
import { useErrorMessage } from "../store/errorStore";
import { useStatusFilter } from "../store/logisticsStore";
import { useToast } from "../store/toastStore";
import { useClickFromDashboard } from "../store/helperStore";
import { getDashboardStatusTabClass } from "../Helpers/dashboardStatusNav";
import DashboardStatusNav from "../Components/DashboardStatusNav";
import { is_hire, is_hod } from "../Helpers/dept_helper";

const normalizeList = (value) =>
  (Array.isArray(value) ? value : [value])
    .filter((item) => item !== undefined && item !== null)
    .map((item) => String(item).trim())
    .filter(Boolean);

const normalizeStatus = (value) =>
  String(value ?? "created")
    .trim()
    .toLowerCase();

const columnHelper = createColumnHelper();

const statusDetails = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "approved")
    return {
      label: "Approved",
      progress: 100,
      color: "bg-green-500",
    };
  if (normalized === "rejected")
    return {
      label: "Rejected",
      progress: 100,
      color: "bg-red-500",
    };
  if (normalized === "review")
    return {
      label: "To be Reviewed",
      progress: 0,
      color: "bg-amber-500",
    };
  if (normalized === "recalled")
    return {
      label: "Recalled - Editable",
      progress: 0,
      color: "bg-blue-500",
    };
  if (normalized === "created")
    return {
      label: "Not Sent For Approval",
      progress: 0,
      color: "bg-gray-400",
    };
  const pendingRole = normalized.replace(/^pending(?:\s+for)?\s*/i, "").trim();
  const progressByRole = {
    cm: 20,
    pm: 40,
    pd: 50,
    hod: 60,
    gm: 80,
  };
  const colorByRole = {
    cm: "bg-amber-500",
    pm: "bg-lime-500",
    pd: "bg-teal-500",
    hod: "bg-yellow-400",
    gm: "bg-orange-500",
  };
  return {
    label: pendingRole ? `Pending for ${pendingRole.toUpperCase()}` : "Pending",
    progress: progressByRole[pendingRole] ?? 0,
    color: colorByRole[pendingRole] ?? "bg-gray-400",
  };
};

const FRDashboards = () => {
  const userInfo = useUserInfo();
  const fleetAccess = getFleetRequestAccess(userInfo);
  const roles = normalizeList(userInfo?.role).map((role) => role.toLowerCase());
  const assignedProjects = normalizeList(userInfo?.pr_code);
  const { setStatusFilter, statusfilter } = useStatusFilter();
  const { errormessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const { resetIsClicked } = useClickFromDashboard();
  const queryClient = useQueryClient();

  const canViewAllProjects = roles.some((role) =>
    ["inith", "hod", "gm", "ceo"].includes(role),
  );
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedProject, setSelectedProject] = useState(() => {
    try {
      return sessionStorage.getItem("fleetRequestProjectFilter") || "";
    } catch {
      return "";
    }
  });
  const { data: projectDetails, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["fleet-request-projects", userInfo?.id],
    queryFn: () => fetchProjectDetails(userInfo),
    enabled: Boolean(userInfo?.id),
    staleTime: 5 * 60 * 1000,
  });
  const availableProjects = Array.isArray(projectDetails)
    ? projectDetails
        .map((project) => String(project?.project ?? "").trim())
        .filter(
          (project) =>
            project &&
            (canViewAllProjects || assignedProjects.includes(project)),
        )
    : assignedProjects;

  useEffect(() => {
    try {
      if (selectedProject) {
        sessionStorage.setItem("fleetRequestProjectFilter", selectedProject);
      } else {
        sessionStorage.removeItem("fleetRequestProjectFilter");
      }
    } catch (error) {
      console.error(
        "Unable to persist the Fleet Request project filter",
        error,
      );
    }
  }, [selectedProject]);

  useEffect(() => {
    if (
      selectedProject &&
      !isProjectsLoading &&
      !availableProjects.includes(selectedProject)
    ) {
      setSelectedProject("");
      setPage(0);
    }
  }, [
    selectedProject,
    isProjectsLoading,
    projectDetails,
    canViewAllProjects,
    assignedProjects.join(","),
  ]);
  const [deleteRequest, setDeleteRequest] = useState({
    id: null,
    docId: "",
    open: false,
  });
  const [deletingId, setDeletingId] = useState(null);
  const [deleteSucceeded, setDeleteSucceeded] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  const handleprint = async (request) => {
    if (!request?.id || printingId) return;
    setPrintingId(request.id);
    clearErrorMessage();

    try {
      await handleFrPrint(request, userInfo);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error ||
          error?.message ||
          "The Fleet Request PDF could not be generated.",
      );
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
      }, 3000);
    } finally {
      setPrintingId(null);
    }
  };
  const handledelete = async (id) => {
    if (!id || deletingId) return;

    setDeletingId(id);
    setDeleteSucceeded(false);
    clearErrorMessage();
    setDeleteRequest({ id: null, docId: "", open: false });

    try {
      const updatedRequest = await UpdateFleetRequestWorkflow({
        id,
        deleted: 1,
        userInfo,
      });

      if (Number(updatedRequest?.deleted) !== 1) {
        throw new Error(
          "The fleet request deletion could not be confirmed. Please refresh and try again.",
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["fleet-requests"] });
      setDeleteSucceeded(true);
      setShowToast();
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "The fleet request could not be deleted. Please try again.";
      setDeleteSucceeded(false);
      setErrorMessage(message);
      setShowToast();
    } finally {
      setDeletingId(null);
      setTimeout(() => {
        setDeleteSucceeded(false);
        resetshowtoast();
        clearErrorMessage();
      }, 3000);
    }
  };
  const showActionTaken = is_hire(userInfo.role) || is_hod(userInfo.role);
  const approvalRoles = roles.filter((role) =>
    ["cm", "pm", "pd", "hod", "gm"].includes(role),
  );
  const canViewAllPending = Boolean(userInfo?.is_admin || fleetAccess.canEdit);
  const serverStatusFilter =
    statusfilter === "Pending"
      ? canViewAllPending
        ? "Pending"
        : (approvalRoles.length ? approvalRoles : roles)
            .map((role) => `pending for ${role}`)
            .join(",") || "pending for __no_role__"
      : statusfilter;
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "fleet-requests",
      canViewAllProjects ? "all" : assignedProjects.join(","),
      selectedProject,
      page,
      limit,
      serverStatusFilter,
    ],
    queryFn: () =>
      GetFleetRequests(
        userInfo,
        selectedProject
          ? [selectedProject]
          : canViewAllProjects
            ? undefined
            : assignedProjects,
        "frdashboard",
        page,
        limit,
        serverStatusFilter,
      ),
    enabled: Boolean(userInfo?.id),
    placeholderData: (previousData) => previousData,
  });

  const requests = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  const total = Number(data?.totalCount);
  const hasKnownTotal = Number.isFinite(total);
  const pageCount = hasKnownTotal ? Math.ceil(total / limit) : null;
  const hasNextPage = hasKnownTotal
    ? page + 1 < pageCount
    : requests.length === limit;

  const columns = [
    columnHelper.display({
      id: "sl",
      header: "Sl. No.",
      meta: { className: "w-20 text-center" },
      cell: ({ row }) => page * limit + row.index + 1,
    }),
    columnHelper.accessor("doc_id", {
      header: "Document no.",
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor("project", {
      header: "Project",
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor("location", {
      header: "Location",
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor(
      (request) => request.created_date ?? request.created_at ?? request.date,
      {
        id: "requestDate",
        header: "Request date",
        meta: { className: "whitespace-nowrap" },
        cell: (info) => formatDateDDMMYYYY(info.getValue()) || "—",
      },
    ),
    columnHelper.accessor("status", {
      header: "Status",
      meta: { className: "min-w-44" },
      cell: (info) => {
        const status = statusDetails(info.getValue());
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              {status.label}
            </span>
            <div className="relative h-2 max-w-2/3 overflow-hidden rounded-full bg-gray-200 shadow-inner">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${status.color}`}
                style={{ width: `${status.progress}%` }}
              />
              {status.progress > 0 && status.progress < 100 && (
                <span
                  className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${status.color}`}
                  style={{ left: `${status.progress}%` }}
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
          if (
            comments &&
            typeof comments === "object" &&
            Object.values(comments).some(
              (item) =>
                item.comment != null && String(item.comment).trim() !== "",
            )
          ) {
            return (
              <div className="space-y-1">
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
            return "-";
          }
        },
      },
    ),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      meta: { className: "text-center" },
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex items-center justify-center gap-1.5">
            <Link
              to={`/fleetrequest/${request.id}`}
              onClick={resetIsClicked}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
              aria-label={`View ${request.doc_id || "fleet request"}`}
            >
              <LuEye size={14} /> View
            </Link>
            <button
              type="button"
              onClick={() => handleprint(request)}
              disabled={printingId === request.id}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              aria-label="PDF"
            >
              <LuFileDown size={14} />
              {printingId === request.id ? "Preparing..." : "PDF"}
            </button>
            {fleetAccess.canEdit && (
              <button
                type="button"
                onClick={() =>
                  setDeleteRequest({
                    id: request.id,
                    docId: request.doc_id || "fleet request",
                    open: true,
                  })
                }
                disabled={deletingId === request.id}
                className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Delete ${request.doc_id || "fleet request"}`}
              >
                <LuTrash2 size={14} />
                {deletingId === request.id ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        );
      },
    }),
    ...(showActionTaken
      ? [
          columnHelper.accessor("action_taken", {
            header: "Action Taken",
            cell: (info) =>
              Number(info.getValue()) === 1 ? (
                <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                  Yes
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                  No
                </span>
              ),
          }),
        ]
      : []),
  ];

  const pagination = { pageIndex: page, pageSize: limit };
  const tableFeaturesConfig = tableFeatures({
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
  });

  const table = useTable({
    data: requests,
    columns,
    features: tableFeaturesConfig,
    state: { pagination },
    manualPagination: true,
    pageCount: pageCount ?? -1,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      if (!next) return;
      setPage(next.pageIndex ?? page);
      setLimit(next.pageSize ?? limit);
    },
  });

  return (
    <main className="dashboard-shell min-h-0 flex-1 bg-slate-50 px-2 py-2 sm:px-4">
      <section className="mx-auto flex h-full max-w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
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
                              setPage(0);
                              break;
                            case "Approved":
                              setStatusFilter("Approved");
                              setPage(0);
                              break;
                            case "Rejected":
                              setStatusFilter("Rejected");
                              setPage(0);
                              break;
                            case "Pending":
                              setStatusFilter("Pending");
                              setPage(0);
                              break;
                            case "Under Review":
                              setStatusFilter("review");
                              setPage(0);
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
            </div>
            {canViewAllProjects && (
              <label className="flex w-full items-center gap-3 bg-slate-100 px-3 py-2.5 sm:w-64">
                <LuFolderKanban className="size-4 shrink-0 text-slate-600" />
                <span className="sr-only">Filter by project</span>
                <select
                  aria-label="Filter fleet requests by project"
                  value={selectedProject}
                  disabled={isProjectsLoading || availableProjects.length === 0}
                  onChange={(event) => {
                    setSelectedProject(event.target.value);
                    setPage(0);
                  }}
                  className="h-6 min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none"
                >
                  <option value="">All projects</option>
                  {availableProjects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
                {selectedProject && (
                  <button
                    type="button"
                    aria-label="Clear project filter"
                    title="Clear project filter"
                    onClick={() => {
                      setSelectedProject("");
                      setPage(0);
                    }}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                  >
                    <LuX size={16} aria-hidden="true" />
                  </button>
                )}
              </label>
            )}
          </div>
        </header>

        <div
          className={`relative overflow-auto ${isLoading ? "min-h-[24rem]" : ""}`}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/85">
              <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-600">
                <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
                Loading fleet requests…
              </div>
            </div>
          ) : isError ? (
            <div className="flex min-h-[24rem] flex-col items-center justify-center px-6 text-center">
              <p className="font-semibold text-slate-800">
                Fleet requests could not be loaded
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                {error?.response?.data?.message ||
                  error?.message ||
                  "Please try again."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Try again
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex min-h-[24rem] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <LuTruck size={23} />
              </span>
              <p className="mt-4 font-semibold text-slate-800">
                No fleet requests found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                There are no requests available for your projects.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100/95 text-xs font-semibold uppercase tracking-wide text-slate-600 backdrop-blur">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`px-3 py-2.5 ${header.column.columnDef.meta?.className || ""}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-200">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="odd:bg-slate-50 even:bg-white transition-colors hover:bg-blue-50/70"
                  >
                    {(row.getVisibleCells?.() ?? row.getAllCells()).map(
                      (cell) => (
                        <td
                          key={cell.id}
                          className={`px-3 py-2.5 text-slate-700 ${cell.column.columnDef.meta?.className || ""}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && !isError && requests.length > 0 && (
          <footer className="flex h-10 flex-col gap-2 border-t border-slate-200 bg-slate-50 px-1 py-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-slate-600">
              {/* Showing {page * limit + 1}–{page * limit + requests.length} */}
              {`Total Number of Records : ${total}`}
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Rows per page:
                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(0);
                  }}
                  className="rounded-md border border-slate-300 bg-white px-1 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <span className="px-1.5 text-sm text-slate-600">
                Page {page + 1}
                {pageCount ? ` of ${pageCount}` : ""}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                disabled={page === 0}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <LuChevronLeft size={14} /> Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!hasNextPage}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                Next <LuChevronRight size={14} />
              </button>
            </div>
          </footer>
        )}
      </section>

      {deleteRequest.open && (
        <Alerts
          message={`Are you sure you want to Delete ${deleteRequest.docId}?`}
          onCancel={() =>
            setDeleteRequest({ id: null, docId: "", open: false })
          }
          onConfirm={() => handledelete(deleteRequest.id)}
        />
      )}

      {deleteSucceeded && !errormessage && (
        <div className="fixed left-1/2 top-5 z-[1100] flex -translate-x-1/2 items-center justify-center gap-2 rounded bg-green-500 px-6 py-3 text-white shadow-lg transition-all duration-300 animate-slide-in">
          <SiTicktick /> Fleet request deleted successfully!
        </div>
      )}

      {showtoast && errormessage && (
        <div className="fixed left-1/2 top-5 z-[1100] flex -translate-x-1/2 items-center justify-center gap-2 rounded bg-red-500 px-6 py-3 text-white shadow-lg transition-all duration-300 animate-slide-in">
          <MdOutlineError /> {errormessage}
        </div>
      )}
    </main>
  );
};

export default FRDashboards;