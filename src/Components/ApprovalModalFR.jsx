/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  LuCheck,
  LuClipboardCheck,
  LuRotateCcwSquare,
  LuX,
} from "react-icons/lu";
import { getFleetRequestApprovalActions } from "../Helpers/approvalFlowHelper";

const ApprovalModalFR = ({
  fleetRequest,
  userInfo,
  isLoading,
  onSubmit,
  onClose,
}) => {
  const [comments, setComments] = useState("");
  const [validationError, setValidationError] = useState("");
  const actions = getFleetRequestApprovalActions({
    fleetRequest,
    user: userInfo,
  });

  const submit = (action) => {
    if (
      (action.action === "reject" || action.action === "review") &&
      !comments.trim()
    ) {
      setValidationError("Comments are required for this action.");
      return;
    }

    setValidationError("");
    onSubmit(action, comments.trim());
  };

  if (!actions.length) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fleet-approval-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <LuClipboardCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <h2
                id="fleet-approval-title"
                className="text-lg font-semibold text-slate-900"
              >
                Fleet Request Approval
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Choose an action to move this request through the approval
                workflow.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close approval modal"
          >
            <LuX size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-3">
          <label htmlFor="fleet-approval-comments" className="block">
            <span className="text-sm font-semibold text-slate-800">
              Comments
            </span>
            <span className="ml-1 text-xs text-slate-500">
              Required for rejection or review
            </span>
            <textarea
              id="fleet-approval-comments"
              rows={4}
              placeholder="Add a clear note for the request initiator or next approver..."
              className={`mt-2 w-full resize-none rounded-lg border p-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-50 ${
                validationError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
              onChange={(event) => {
                setComments(event.target.value);
                setValidationError("");
              }}
              value={comments}
              disabled={isLoading}
              aria-invalid={Boolean(validationError)}
            />
          </label>
          {validationError && (
            <p className="mt-1.5 text-sm font-medium text-red-600" role="alert">
              {validationError}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {actions.map((action) => (
              <button
                key={action.action}
                type="button"
                disabled={isLoading}
                onClick={() => submit(action)}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
                  action.action === "approve"
                    ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                    : action.action === "reject"
                      ? "border border-red-200 bg-white text-red-700 hover:bg-red-50 focus:ring-red-400"
                      : "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 focus:ring-amber-400"
                }`}
              >
                {action.action === "approve" ? (
                  <LuCheck aria-hidden="true" />
                ) : action.action === "reject" ? (
                  <LuX aria-hidden="true" />
                ) : (
                  <LuRotateCcwSquare aria-hidden="true" />
                )}
                {isLoading ? "Processing..." : action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModalFR;
