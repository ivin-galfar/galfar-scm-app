/* eslint-disable react/prop-types */
import { useState } from "react";

const FleetRequestConfirmationModal = ({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  isLoading,
  variant = "primary",
  allowComments = false,
  onConfirm,
  onCancel,
}) => {
  const [comments, setComments] = useState("");

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/50 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="fleet-confirmation-title"
      >
        <h2
          id="fleet-confirmation-title"
          className="text-lg font-semibold text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{message}</p>

        {allowComments && (
          <label htmlFor="fleet-resubmission-comments" className="mt-4 block">
            <span className="text-sm font-semibold text-slate-800">
              Comments{" "}
              <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <textarea
              id="fleet-resubmission-comments"
              rows={4}
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              disabled={isLoading}
              placeholder="Add any comments for this request..."
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 p-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </label>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(comments.trim())}
            disabled={isLoading}
            className={`cursor-pointer rounded px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FleetRequestConfirmationModal;
