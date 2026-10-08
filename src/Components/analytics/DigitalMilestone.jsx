/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  LuEye,
  LuFileText,
  LuLeaf,
  LuTrees,
  LuWorkflow,
  LuX,
  LuZap,
} from "react-icons/lu";
import {
  calculatePaperPagesSaved,
  calculateTreesSaved,
  getMilestoneStorageKey,
  isManagementUser,
} from "../../Helpers/dashboardMilestone";
import { PAPERLESS_MILESTONE_THRESHOLD } from "../../../config/ENV";

const AUTO_DISMISS_MS = 12000;

const DigitalMilestone = ({ totalStatements, userInfo }) => {
  const [isVisible, setIsVisible] = useState(false);
  const papersaved = calculatePaperPagesSaved(PAPERLESS_MILESTONE_THRESHOLD);
  const treesSaved = calculateTreesSaved(papersaved);

  useEffect(() => {
    if (
      Number(totalStatements) < PAPERLESS_MILESTONE_THRESHOLD ||
      !isManagementUser(userInfo)
    ) {
      return;
    }

    const storageKey = getMilestoneStorageKey(userInfo);
    if (!storageKey) return;

    const today = new Date().toISOString().split("T")[0];
    const lastShownDate = localStorage.getItem(storageKey);

    // Already shown today
    if (lastShownDate === today) return;

    localStorage.setItem(storageKey, today);
    setIsVisible(true);

    const dismissTimer = window.setTimeout(
      () => setIsVisible(false),
      AUTO_DISMISS_MS,
    );

    return () => window.clearTimeout(dismissTimer);
  }, [totalStatements, userInfo]);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Digital milestone"
      aria-live="polite"
      role="status"
      className="digital-milestone relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-16 size-40 rounded-full bg-emerald-200/30 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-emeald-500"
      />

      <div className="relative px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2.5 justify-between">
          <div
            className="flex min-w-0 items-center gap-4 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100/70 px-3 py-2 shadow-sm shadow-emerald-100"
            title="Digital paperless workflow milestone"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 shadow-sm">
              <LuLeaf aria-hidden="true" className="size-4.5" />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
                Digital milestone
              </p>

              <p className="mt-0.5 truncate text-xl font-black leading-none text-emerald-900 sm:text-2xl">
                {Number(PAPERLESS_MILESTONE_THRESHOLD).toLocaleString("en-US")}+
              </p>

              <p className="mt-1 text-xs font-black leading-tight text-emerald-800 sm:text-sm">
                Paperless Approvals
              </p>
            </div>
          </div>

          <div
            className="flex shrink-0 items-center gap-2"
            aria-label="Estimated environmental impact"
          >
            <div
              className="flex min-w-[165px] items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2"
              title="Including attachments and supporting documents"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-white text-[var(--galfar-600)] shadow-sm">
                <LuFileText aria-hidden="true" className="size-4.5" />
              </span>

              <div className="min-w-0">
                <p className="text-xl font-black leading-none text-slate-800 sm:text-2xl">
                  {papersaved.toLocaleString("en-US")}+
                </p>

                <p className="mt-1 whitespace-nowrap text-xs font-extrabold leading-tight text-slate-600 sm:text-sm">
                  Papers saved
                </p>
              </div>
            </div>

            <div
              className="flex min-w-[165px] items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2"
              aria-label={`Approximately ${treesSaved.toLocaleString(
                "en-US",
              )} trees saved`}
              title={`Approximately ${treesSaved.toLocaleString(
                "en-US",
              )} trees saved`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 shadow-sm">
                <LuTrees aria-hidden="true" size={40} />
              </span>

              <div className="min-w-0">
                <p className="text-xl font-black leading-none text-slate-800 sm:text-2xl">
                  {treesSaved.toLocaleString("en-IN")}+
                </p>

                <p className="mt-1 whitespace-nowrap text-xs font-extrabold leading-tight text-slate-600 sm:text-sm">
                  Trees saved
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close digital milestone notification"
              onClick={() => setIsVisible(false)}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-[var(--galfar-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--galfar-600)] focus-visible:ring-offset-2"
            >
              <LuX aria-hidden="true" className="size-3.5" />
              <span className="hidden sm:inline cursor-pointer">Close</span>
            </button>
          </div>
        </div>

        <div
          className="mt-2 border-t border-slate-100 pt-1.5"
          aria-label="Digital workflow benefits"
        >
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            <div className="flex items-center gap-2 rounded-lg px-2 ">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sky-50 text-[var(--galfar-600)]">
                <LuWorkflow aria-hidden="true" className="size-4" />
              </span>

              <span className="text-xs font-black leading-snug text-slate-700">
                Streamlined Online Process
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg px-2 ">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <LuZap aria-hidden="true" className="size-4" />
              </span>

              <span className="text-xs font-black leading-snug text-slate-700">
                Lightning-Speed Approvals
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg px-2 ">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <LuEye aria-hidden="true" className="size-4" />
              </span>

              <span className="text-xs font-black leading-snug text-slate-700">
                End-to-End Visibility
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DigitalMilestone;
