/* eslint-disable react/prop-types */
import SharePointListSelector from "./SharePointListSelector";

const SharePointToolbar = ({
  lists,
  listName,
  onListChange,
  filterDraft,
  onFilterDraftChange,
  onApplyFilter,
  disabled,
}) => (
  <form
    className="mb-2 flex shrink-0 flex-col gap-3 rounded border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:flex-row lg:items-end"
    onSubmit={(event) => {
      event.preventDefault();
      onApplyFilter();
    }}
  >
    <SharePointListSelector
      lists={lists}
      value={listName}
      onChange={onListChange}
      disabled={disabled || lists.length === 0}
    />

    <label className="flex min-w-56 flex-1 flex-col gap-1.5 text-sm font-medium text-slate-700">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        OData filter
        <span className="text-xs font-normal text-slate-500">
          (Filters must use a configured indexed field.)
        </span>{" "}
      </span>
      <input
        value={filterDraft}
        onChange={(event) => onFilterDraftChange(event.target.value)}
        disabled={disabled || !listName}
        placeholder="Status eq 'Open'"
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </label>

    <button
      type="submit"
      disabled={disabled || !listName}
      className="h-10 rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Apply filter
    </button>
  </form>
);

export default SharePointToolbar;
