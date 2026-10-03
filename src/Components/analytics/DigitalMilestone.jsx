/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  LuBadgeCheck,
  LuEye,
  LuLeaf,
  LuWorkflow,
  LuX,
  LuZap,
} from "react-icons/lu";
import {
  getMilestoneStorageKey,
  isManagementUser,
} from "../../Helpers/dashboardMilestone";
import { PAPERLESS_MILESTONE_THRESHOLD } from "../../../config/ENV";

const AUTO_DISMISS_MS = 12000;

const DigitalMilestone = ({ totalStatements, userInfo }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (
      Number(totalStatements) < PAPERLESS_MILESTONE_THRESHOLD ||
      !isManagementUser(userInfo)
    ) {
      return;
    }

    const storageKey = getMilestoneStorageKey(userInfo);
    if (!storageKey || localStorage.getItem(storageKey)) return;

    localStorage.setItem(storageKey, "true");
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
      className="digital-milestone relative overflow-hidden rounded-2xl border border-sky-300 bg-white ring-1 ring-sky-100/80"
    >
      <div
        aria-hidden="true"
        className="digital-milestone__glow absolute -right-10 -top-16 size-36 rounded-full bg-emerald-100/60 blur-3xl"
      />
      <div className="digital-milestone__accent absolute inset-y-0 left-0 w-1 bg-emerald-500" />
      <div className="flex flex-wrap items-center gap-2.5 px-3 py-2 sm:px-4 lg:flex-nowrap">
        <div className="digital-milestone__icon flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100">
          <LuLeaf aria-hidden="true" className="size-4" />
        </div>

        <div className="relative min-w-0 flex-1">
          <h2 className="digital-milestone__title text-sm font-black tracking-[-0.015em] sm:text-base">
            {PAPERLESS_MILESTONE_THRESHOLD}+ Paperless Approvals
          </h2>
          <div className="digital-milestone__details flex flex-wrap items-center gap-x-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-emerald-700 sm:text-[11px]">
            <span className="inline-flex items-center gap-1">
              <LuBadgeCheck aria-hidden="true" className="size-3.5" />
              Digital Approvals
            </span>
            <span aria-hidden="true" className="text-slate-300">
              &middot;
            </span>
            <span>
              <span aria-hidden="true">&#9678;</span> Better Tracking
            </span>
          </div>
          <p className="digital-milestone__message mt-0.5 text-[11px] font-semibold text-slate-600 sm:text-xs">
            A milestone towards smarter and more efficient digital workflows.
          </p>
        </div>

        <div
          className="digital-milestone__benefits order-last grid w-full grid-cols-3 gap-2 border-t border-sky-100 pt-2.5 lg:order-none lg:w-auto lg:min-w-[420px] lg:border-l lg:border-t-0 lg:py-0 lg:pl-4"
          aria-label="Digital workflow benefits"
        >
          <div className="digital-milestone__benefit flex items-center gap-2 px-1 py-1">
            <LuWorkflow
              aria-hidden="true"
              className="size-4 shrink-0 text-[var(--galfar-600)]"
            />
            <span className="text-[11px] font-extrabold leading-snug text-slate-700 sm:text-xs">
              Streamlined Online Process
            </span>
          </div>
          <div className="digital-milestone__benefit flex items-center gap-2 px-1 py-1">
            <LuZap
              aria-hidden="true"
              className="size-4 shrink-0 text-amber-500"
            />
            <span className="text-[11px] font-extrabold leading-snug text-slate-700 sm:text-xs">
              Lightning-Speed Approvals
            </span>
          </div>
          <div className="digital-milestone__benefit flex items-center gap-2 px-1 py-1">
            <LuEye
              aria-hidden="true"
              className="size-4 shrink-0 text-emerald-600"
            />
            <span className="text-[11px] font-extrabold leading-snug text-slate-700 sm:text-xs">
              End-to-End Visibility
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close digital milestone notification"
          onClick={() => setIsVisible(false)}
          className="relative inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-[var(--galfar-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--galfar-600)] focus-visible:ring-offset-2 cursor-pointer"
        >
          <LuX aria-hidden="true" className="size-3.5" />
          <span>Close</span>
        </button>
      </div>
    </aside>
  );
};

export default DigitalMilestone;
