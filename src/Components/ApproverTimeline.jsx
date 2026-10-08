/* eslint-disable react/prop-types */
import {
  LuCheck,
  LuCircle,
  LuClock3,
  LuUserRound,
  LuX,
} from "react-icons/lu";
import { usePmName, useSelectedProject } from "../store/logisticsStore";
import {
  formatDateDDMMYYYYHHMMSS,
  formatName,
  getApproverName,
} from "../Helpers/helperfunctions";
import { SPECIAL_PROJECTS } from "../../config/ENV";

const STEP_STYLES = {
  approved: {
    label: "Approved",
    icon: LuCheck,
    node: "border-green-600 bg-green-600 text-white",
    badge: "border-green-200 bg-green-50 text-green-700",
  },
  pending: {
    label: "Pending",
    icon: LuClock3,
    node: "border-amber-500 bg-amber-500 text-white",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
  },
  rejected: {
    label: "Rejected",
    icon: LuX,
    node: "border-red-600 bg-red-600 text-white",
    badge: "border-red-200 bg-red-50 text-red-700",
  },
  queued: {
    label: "In Queue",
    icon: LuCircle,
    node: "border-blue-300 bg-blue-100 text-blue-700",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

const ROLE_LABELS = {
  initlg: "Initiator",
  incharge: "In-Charge",
  pm: "Project Manager",
  pd: "Project Director",
  gm: "General Manager",
  fm: "Finance Manager",
  ceo: "CEO",
};

const ApproverTimeline = ({ approverhistory }) => {
  const info = Array.isArray(approverhistory?.approver_info)
    ? approverhistory.approver_info
    : [];
  const { pmname } = usePmName();
  const { selectedproject } = useSelectedProject();
  const hasPD = (SPECIAL_PROJECTS ?? []).includes(Number(selectedproject));

  const roles = [
    "initlg",
    "incharge",
    "pm",
    ...(hasPD ? ["pd"] : []),
    "gm",
    "fm",
    "ceo",
  ];

  if (!approverhistory) {
    return (
      <div className="flex min-h-72 w-full max-w-3xl flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <LuUserRound className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-base font-semibold text-slate-800">
          Select a document to view its timeline
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Approval steps, approver details, dates, and comments will appear
          here.
        </p>
      </div>
    );
  }

  const normalizedStatus = String(approverhistory.status ?? "").toLowerCase();
  const pendingIndex = roles.findIndex((role) =>
    normalizedStatus.includes(role),
  );
  const rejectedRole = String(info.at(-1)?.role ?? "").toLowerCase();
  const rejectedRoleIndex = roles.indexOf(rejectedRole);
  const rejectedIndex =
    normalizedStatus === "rejected"
      ? rejectedRoleIndex >= 0
        ? rejectedRoleIndex
        : info.length
          ? Math.min(info.length - 1, roles.length - 1)
          : -1
      : -1;
  const isFullyApproved = normalizedStatus === "approved";
  const createdBy = approverhistory.createdby?.split("@")[0];

  const getStepStatus = (index) => {
    if (isFullyApproved) return "approved";
    if (rejectedIndex >= 0) {
      if (index < rejectedIndex) return "approved";
      if (index === rejectedIndex) return "rejected";
      return "queued";
    }
    if (pendingIndex >= 0) {
      if (index < pendingIndex) return "approved";
      if (index === pendingIndex) return "pending";
    }
    return "queued";
  };

  const getDatetimeByRole = (role) =>
    info.find(
      (approval) => String(approval.role ?? "").toLowerCase() === role,
    )?.datetime;

  const getComment = (role) => {
    const commentFields = {
      incharge: "comment_in",
      pm: "comment_pm",
      pd: "comment_pd",
      gm: "comment_gm",
      fm: "comment_fm",
      ceo: "comment_ceo",
    };
    return approverhistory[commentFields[role]] ?? "";
  };

  return (
    <section
      className="relative w-full max-w-4xl px-2 py-3 sm:px-4"
      aria-label="Approval timeline"
    >
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-[1.7rem] top-8 w-0.5 bg-slate-200 md:left-1/2 md:-translate-x-1/2"
      />

      <ol className="relative space-y-6">
        {roles.map((role, index) => {
          const isLeft = index % 2 === 0;
          const status = getStepStatus(index);
          const style = STEP_STYLES[status];
          const StatusIcon = style.icon;
          const name =
            role === "pm"
              ? formatName(pmname?.[0])
              : role === "initlg"
                ? createdBy
                : getApproverName(role);
          const datetime = getDatetimeByRole(role);
          const comment = getComment(role);

          return (
            <li
              key={role}
              className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] md:gap-5"
            >
              <div
                className={`z-10 col-start-1 row-start-1 flex size-10 items-center justify-center justify-self-center rounded-full border-2 shadow-sm md:col-start-2 ${style.node}`}
                aria-label={`${ROLE_LABELS[role]}: ${style.label}`}
              >
                <StatusIcon className="size-4" aria-hidden="true" />
              </div>

              <article
                className={`col-start-2 row-start-1 min-w-0 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:w-full md:max-w-sm ${
                  isLeft
                    ? "md:col-start-1 md:justify-self-end"
                    : "md:col-start-3 md:justify-self-start"
                } ${status === "pending" ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {ROLE_LABELS[role]}
                    </p>
                    <p className="mt-0.5 break-words text-sm font-semibold text-slate-900">
                      {name || "Awaiting assignment"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold ${style.badge}`}
                  >
                    <StatusIcon className="size-3" aria-hidden="true" />
                    {style.label}
                  </span>
                </div>

                {datetime && (
                  <time className="mt-3 block text-xs font-medium text-slate-500">
                    {formatDateDDMMYYYYHHMMSS(datetime)}
                  </time>
                )}

                {comment && (
                  <p className="mt-3 break-words rounded-lg bg-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-700">
                    {comment}
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default ApproverTimeline;
