/* eslint-disable react/prop-types */
import { formatNumbers } from "../../Helpers/helperfunctions";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const PAGE_SIZES = [25, 50, 100];

const SharePointPagination = ({
  pageIndex,
  count,
  countError,
  onRetryCount,
  pageSize,
  onPageSizeChange,
  hasPreviousPage,
  hasNextPage,
  isLoading,
  onPrevious,
  onNext,
  pageCount,
  onFirstPage,
}) => (
  <footer className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-slate-50 px-1 py-1 sm:flex-row sm:items-center sm:justify-between">
    <span className="text-sm font-semibold text-slate-600" aria-live="polite">
      <span>
        {countError
          ? "Total unavailable"
          : count === null
            ? "Counting matching rows…"
            : `Total items in list: ${formatNumbers(count)}`}
      </span>
      {countError && (
        <button
          type="button"
          onClick={onRetryCount}
          className="ml-2 text-sm font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Retry total
        </button>
      )}
    </span>
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <label className="flex items-center gap-2 text-sm text-slate-600">
        Rows per page:
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          disabled={isLoading}
          className="h-6 rounded-md border border-slate-300 bg-white px-1 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <span className="px-1.5 text-sm text-slate-600">
        Page{" "}
        <strong>
          {pageIndex + 1} of {formatNumbers(pageCount)}
        </strong>
      </span>
      <button
        onClick={onFirstPage}
        disabled={!hasPreviousPage}
        className={`h-6 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 motion-reduce:transition-none disabled:cursor-not-allowed`}
      >
        «
      </button>
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPreviousPage || isLoading}
        className="inline-flex h-6 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
        aria-label="Previous page"
      >
        <LuChevronLeft size={14} /> Prev
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNextPage || isLoading}
        className="inline-flex h-6 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
        aria-label="Next page"
      >
        Next <LuChevronRight size={14} />
      </button>
    </div>
  </footer>
);

export default SharePointPagination;
