/* eslint-disable react/prop-types */
const SharePointEmptyState = ({ hasConfiguredLists, hasList }) => (
  <div className="flex h-full min-h-40 flex-col items-center justify-center px-6 text-center">
    <p className="text-base font-semibold text-slate-800">
      {!hasConfiguredLists
        ? "No SharePoint lists are configured"
        : hasList
          ? "No records found"
          : "Select a SharePoint list"}
    </p>
    <p className="mt-1 max-w-lg text-sm text-slate-500">
      {!hasConfiguredLists
        ? "Configure VITE_SHAREPOINT_LISTS with list names allowed by the backend."
        : hasList
          ? "This list has no records matching the current filter."
          : "Choose a list above to load its records."}
    </p>
  </div>
);

export default SharePointEmptyState;
