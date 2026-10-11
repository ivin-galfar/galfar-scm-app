/* eslint-disable react/prop-types */
const SharePointErrorState = ({ message, onRetry, onRestart }) => (
  <div
    className="flex h-full min-h-40 flex-col items-center justify-center px-6 text-center"
    role="alert"
  >
    <p className="text-base font-semibold text-slate-800">
      Unable to load SharePoint records
    </p>
    <p className="mt-1 max-w-xl text-sm text-slate-600">{message}</p>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {onRestart && (
        <button
          type="button"
          onClick={onRestart}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Restart from first page
        </button>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      >
        Retry
      </button>
    </div>
  </div>
);

export default SharePointErrorState;
