import { useEffect, useRef, useState } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import { SHAREPOINT_LISTS } from "../../config/ENV";
import { GetSharePointItemCount, GetSharePointItems } from "../APIs/api";
import {
  SharePointDataTable,
  SharePointEmptyState,
  SharePointErrorState,
  SharePointLoading,
  SharePointPagination,
  SharePointToolbar,
} from "../Components/sharepoint";

const CURSOR_ERROR_CODES = new Set(["CURSOR_EXPIRED", "INVALID_CURSOR"]);

const SharePointPage = () => {
  const userInfo = useUserInfo();
  const [listName, setListName] = useState(SHAREPOINT_LISTS[0] ?? "");
  const [pageSize, setPageSize] = useState(100);
  const [filterDraft, setFilterDraft] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(null);
  const [countError, setCountError] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [countRetryVersion, setCountRetryVersion] = useState(0);
  const cursorHistoryRef = useRef([null]);
  const requestSequenceRef = useRef(0);
  const countRequestSequenceRef = useRef(0);

  useEffect(() => {
    if (!listName) {
      setItems([]);
      setItemCount(null);
      setCountError(false);
      setHasNextPage(false);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    const requestSequence = ++requestSequenceRef.current;
    const cursor = cursorHistoryRef.current[pageIndex] ?? undefined;
    setIsLoading(true);
    setError(null);
    setItems([]);
    setHasNextPage(false);

    const fetchItems = async () => {
      try {
        const response = await GetSharePointItems({
          userInfo,
          listName,
          pageSize,
          filter: appliedFilter || undefined,
          cursor,
        });

        if (requestSequence !== requestSequenceRef.current) return;

        const pageItems = Array.isArray(response?.items) ? response.items : [];

        setItems(pageItems);

        const nextCursor = response?.nextCursor ?? null;
        cursorHistoryRef.current[pageIndex + 1] = nextCursor;

        setHasNextPage(Boolean(response?.hasNextPage));
      } catch (requestError) {
        if (requestSequence !== requestSequenceRef.current) return;

        const responseError = requestError?.response?.data;
        const code = responseError?.error;

        setError({
          message:
            responseError?.message ||
            (typeof code === "string" ? code : null) ||
            "Check your connection and try again.",
          canRestart: CURSOR_ERROR_CODES.has(code),
        });
      } finally {
        if (requestSequence === requestSequenceRef.current) {
          setIsLoading(false);
        }
      }
    };
    fetchItems();

    return () => {
      if (requestSequence === requestSequenceRef.current) {
        requestSequenceRef.current += 1;
      }
    };
  }, [
    appliedFilter,
    listName,
    pageIndex,
    pageSize,
    requestVersion,
    userInfo?.email,
    userInfo?.token,
  ]);

  useEffect(() => {
    if (!listName) return undefined;

    const countRequestSequence = ++countRequestSequenceRef.current;
    setItemCount(null);
    setCountError(false);

    const fetchItemCount = async () => {
      try {
        const response = await GetSharePointItemCount({
          userInfo,
          listName,
        });

        if (countRequestSequence !== countRequestSequenceRef.current) return;

        const count = Number(response?.count);

        if (Number.isFinite(count) && count >= 0) {
          setItemCount(count);
        } else {
          setCountError(true);
        }
      } catch {
        if (countRequestSequence === countRequestSequenceRef.current) {
          setCountError(true);
        }
      }
    };

    fetchItemCount();

    return () => {
      if (countRequestSequence === countRequestSequenceRef.current) {
        countRequestSequenceRef.current += 1;
      }
    };
  }, [listName, countRetryVersion, userInfo?.email, userInfo?.token]);

  const resetPagination = () => {
    requestSequenceRef.current += 1;
    cursorHistoryRef.current = [null];
    setPageIndex(0);
  };

  const handleListChange = (nextListName) => {
    resetPagination();
    setFilterDraft("");
    setAppliedFilter("");
    setListName(nextListName);
  };

  const handlePageSizeChange = (nextPageSize) => {
    resetPagination();
    setPageSize(nextPageSize);
  };

  const handleApplyFilter = () => {
    resetPagination();
    setAppliedFilter(filterDraft.trim());
    setRequestVersion((current) => current + 1);
  };

  const handleNext = () => {
    if (!hasNextPage || !cursorHistoryRef.current[pageIndex + 1]) return;
    requestSequenceRef.current += 1;
    setPageIndex((current) => current + 1);
  };

  const handlePrevious = () => {
    if (pageIndex === 0) return;
    requestSequenceRef.current += 1;
    setPageIndex((current) => Math.max(0, current - 1));
  };

  const handleRestart = () => {
    resetPagination();
    setRequestVersion((current) => current + 1);
  };

  const handleRetry = () => {
    requestSequenceRef.current += 1;
    setRequestVersion((current) => current + 1);
  };

  const handleRetryCount = () => {
    setCountRetryVersion((current) => current + 1);
  };

  const handleFirstPage = () => {
    setPageIndex(0);
  };
  const pageCount = Math.ceil(itemCount / pageSize);

  return (
    <main className="dashboard-shell relative flex h-0 min-h-0 w-full flex-grow flex-col overflow-hidden bg-slate-50 px-2 pb-2 pt-2 sm:px-3">
      <header className="mb-2 flex shrink-0 items-baseline gap-3 px-1 sm:px-2">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          SharePoint Data Viewer
        </h1>
        <p className="text-sm text-slate-600">
          Browse configured SharePoint lists with server-side pagination.
        </p>
      </header>
      <SharePointToolbar
        lists={SHAREPOINT_LISTS}
        listName={listName}
        onListChange={handleListChange}
        filterDraft={filterDraft}
        onFilterDraftChange={setFilterDraft}
        onApplyFilter={handleApplyFilter}
        disabled={false}
      />
      <section
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow"
        aria-label="SharePoint records"
      >
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {isLoading ? (
            <SharePointLoading />
          ) : error ? (
            <SharePointErrorState
              message={error.message}
              onRetry={handleRetry}
              onRestart={error.canRestart ? handleRestart : undefined}
            />
          ) : items.length > 0 ? (
            <SharePointDataTable items={items} />
          ) : (
            <SharePointEmptyState
              hasConfiguredLists={SHAREPOINT_LISTS.length > 0}
              hasList={Boolean(listName)}
            />
          )}
        </div>

        {listName && !error && (
          <SharePointPagination
            pageIndex={pageIndex}
            count={itemCount}
            countError={countError}
            onRetryCount={handleRetryCount}
            pageSize={pageSize}
            pageCount={pageCount}
            onPageSizeChange={handlePageSizeChange}
            hasPreviousPage={pageIndex > 0}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onFirstPage={handleFirstPage}
          />
        )}
      </section>
    </main>
  );
};

export default SharePointPage;
