const SharePointLoading = () => (
  <div
    className="flex h-full min-h-40 flex-col items-center justify-center gap-3 text-slate-600"
    role="status"
    aria-live="polite"
  >
    <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-sky-700 motion-reduce:animate-none" />
    <span className="text-sm font-medium">Loading SharePoint records…</span>
  </div>
);

export default SharePointLoading;
