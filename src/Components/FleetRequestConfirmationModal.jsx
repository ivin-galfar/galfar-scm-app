/* eslint-disable react/prop-types */
const FleetRequestConfirmationModal = ({
  title,
  message,
  confirmLabel,
  isLoading,
  onConfirm,
  onCancel,
}) => (
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
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Processing..." : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default FleetRequestConfirmationModal;
