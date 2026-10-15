/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  LuEye,
  LuArrowRight,
  LuFileText,
  LuLeaf,
  LuTrees,
  LuWorkflow,
  LuX,
  LuZap,
  LuWind,
} from "react-icons/lu";
import {
  calculateCo2SavedKg,
  calculatePaperPagesSaved,
  calculateTreesSaved,
  formatLocalDate,
  getMilestoneStorageKey,
} from "../../Helpers/dashboardMilestone";
import { PAPERLESS_MILESTONE_THRESHOLD } from "../../../config/ENV";

const DigitalMilestone = ({ alldepttotalStatementscount, userInfo }) => {
  const [isVisible, setIsVisible] = useState(false);
  const papersaved = calculatePaperPagesSaved(alldepttotalStatementscount);
  const treesSaved = calculateTreesSaved(papersaved);
  const co2SavedKg = calculateCo2SavedKg(papersaved);

  useEffect(() => {
    if (Number(alldepttotalStatementscount) < PAPERLESS_MILESTONE_THRESHOLD) {
      return;
    }

    const storageKey = getMilestoneStorageKey(userInfo);
    if (!storageKey) return;

    const today = formatLocalDate(new Date());
    const lastShownDate = localStorage.getItem(storageKey);

    // Already shown today
    if (lastShownDate === today) return;

    localStorage.setItem(storageKey, today);
    setIsVisible(true);
  }, [alldepttotalStatementscount, userInfo]);
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
        <div className="flex items-center justify-between gap-2.5">
          <div
            className="flex min-w-0 items-center gap-4 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100/70 px-3 py-2 shadow-sm shadow-emerald-100"
            title="Digital paperless workflow milestone"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 shadow-sm">
              <LuLeaf aria-hidden="true" className="size-6.5" />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
                Go Green Initiatives
              </p>

              <p className="mt-0.5 truncate text-xl font-black leading-none text-emerald-900 sm:text-2xl">
                {Number(PAPERLESS_MILESTONE_THRESHOLD).toLocaleString("en-US")}+
              </p>

              <p className="mt-1 font-black leading-tight text-emerald-800 sm:text-lg">
                Paperless Approvals
              </p>
            </div>
            <p className="ml-1 self-end whitespace-nowrap pb-0.5 text-[9px] font-medium leading-tight text-emerald-700/80 sm:text-[10px]">
              *Collectively across company
            </p>
          </div>
          <p className="hidden min-w-0 flex-1 px-2 text-center text-lg font-extrabold  text-slate-700 lg:block">
            Galfar&apos;s Journey Towards a{" "}
            <span className="text-green-700">Greener Tomorrow</span>
          </p>

          <div
            className="flex shrink-0 items-center gap-2"
            aria-label="Estimated environmental impact"
          >
            <div
              className="flex min-w-[165px] items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2"
              title="Including attachments and supporting documents"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-white text-[var(--galfar-600)] shadow-sm">
                <LuFileText aria-hidden="true" className="size-6.5" />
              </span>

              <div className="min-w-0">
                <p className="text-xl font-black leading-none text-slate-800 sm:text-2xl">
                  {papersaved.toLocaleString("en-US")}+
                </p>

                <p className="mt-1 whitespace-nowrap text-xs font-extrabold leading-tight text-slate-600 sm:text-lg">
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
                <LuTrees aria-hidden="true" className="size-8.5" />
              </span>

              <div className="min-w-0">
                <p className="text-xl font-black leading-none text-slate-800 sm:text-2xl">
                  {treesSaved.toLocaleString("en-IN")}+
                </p>

                <p className="mt-1 whitespace-nowrap text-xs font-extrabold leading-tight text-slate-600 sm:text-lg">
                  Trees saved
                </p>
              </div>
            </div>
            <div
              className="flex min-w-[165px] items-center gap-2 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 px-3 py-2 shadow-sm shadow-teal-100"
              aria-label={`Approximately ${co2SavedKg.toLocaleString("en-US")} kilograms of carbon dioxide emissions avoided`}
              title="Estimated carbon dioxide emissions avoided by the paper saved"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-white text-teal-700 shadow-sm">
                <LuWind aria-hidden="true" className="size-6.5" />
              </span>

              <div className="min-w-0">
                <p className="text-xl font-black leading-none text-teal-900 sm:text-2xl">
                  {co2SavedKg.toLocaleString("en-US")} kg
                </p>

                <p className="mt-1 whitespace-nowrap text-xs font-extrabold leading-tight text-teal-800 sm:text-lg">
                  CO₂ emissions avoided
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close digital milestone notification"
              onClick={() => setIsVisible(false)}
              title="Dismiss milestone"
              className="group inline-flex size-8 shrink-0 items-center justify-center
    rounded-lg border border-slate-200 bg-white text-slate-400
    shadow-sm transition-all duration-200
    hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              <LuX
                aria-hidden="true"
                className="size-4 transition-transform duration-200
      group-hover:rotate-90"
              />
            </button>
          </div>
        </div>

        <div
          className="mt-1.5 border-t border-slate-100 pt-1.5"
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
