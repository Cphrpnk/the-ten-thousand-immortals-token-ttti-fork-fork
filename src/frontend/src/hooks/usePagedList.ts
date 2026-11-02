import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/** Default page size sent to the backend (the backend caps it at 100). */
export const DEFAULT_PAGE_SIZE = 50n;

/** One page returned by a cursor-paged backend list. */
export interface CursorPage<T> {
  items: Array<T>;
  nextCursor?: bigint;
}

interface PagedListOptions<T> {
  /** Stable base key; the page size is appended so each size has its own cache. */
  queryKey: ReadonlyArray<unknown>;
  enabled: boolean;
  pageSize?: bigint;
  fetchPage: (cursor: bigint | null, limit: bigint) => Promise<CursorPage<T>>;
  /** Identity of an item, used to drop duplicates across pages. */
  getKey: (item: T) => string;
}

/** Page-by-page list state consumed by the pages. */
export interface PagedList<T> {
  /** All loaded items in backend order, without duplicates. */
  items: Array<T>;
  /** First page loading. */
  isLoading: boolean;
  /** First page failed. */
  isError: boolean;
  /** A later page failed; the loaded items stay visible. */
  isLoadMoreError: boolean;
  error: Error | null;
  /** First page loaded and no item at all. */
  isEmpty: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  /** Everything is loaded and the list is not empty. */
  isEnd: boolean;
  loadMore: () => void;
  /** Retries the first page, or the failed next page. */
  retry: () => void;
  refetch: () => void;
}

/** Load-more list over a backend that takes (cursor, limit) and returns { items; nextCursor }. */
export function usePagedList<T>({
  queryKey,
  enabled,
  pageSize = DEFAULT_PAGE_SIZE,
  fetchPage,
  getKey,
}: PagedListOptions<T>): PagedList<T> {
  const query = useInfiniteQuery({
    queryKey: [...queryKey, "pages", pageSize.toString()],
    initialPageParam: null as bigint | null,
    queryFn: ({ pageParam }) => fetchPage(pageParam, pageSize),
    getNextPageParam: (last) => last.nextCursor,
    enabled,
  });

  const items = useMemo(() => {
    const seen = new Set<string>();
    const merged: Array<T> = [];
    for (const page of query.data?.pages ?? []) {
      for (const item of page.items) {
        const key = getKey(item);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(item);
      }
    }
    return merged;
  }, [query.data, getKey]);

  const hasData = query.data !== undefined;
  const isLoadMoreError = query.isFetchNextPageError;
  const { fetchNextPage, refetch, hasNextPage, isFetchingNextPage } = query;

  return {
    items,
    isLoading: query.isLoading,
    isError: query.isError && !hasData,
    isLoadMoreError,
    error: query.error,
    isEmpty: hasData && items.length === 0,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    isEnd: hasData && !hasNextPage && items.length > 0,
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
    },
    retry: () => {
      if (isLoadMoreError) void fetchNextPage();
      else void refetch();
    },
    refetch: () => {
      void refetch();
    },
  };
}
