"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/lib/hooks";
import { PaginationResult } from "@/lib/pagination";

const defaultPagination = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

interface UseDataTableOptions<T> {
  fetchUrl: string;
  buildQuery?: (page: number, limit: number, search: string) => string;
  parseResponse: (result: unknown) => {
    items: T[];
    pagination: PaginationResult<T>;
  };
  enabled?: boolean;
  initialLimit?: number;
}

export function useDataTable<T>({
  fetchUrl,
  buildQuery,
  parseResponse,
  enabled = true,
  initialLimit = 10,
}: UseDataTableOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [pagination, setPagination] =
    useState<PaginationResult<T>>(defaultPagination as PaginationResult<T>);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const fetchData = useCallback(
    async (targetPage: number, searchValue: string, showPaginationLoading = false) => {
      if (showPaginationLoading) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const query = buildQuery
          ? buildQuery(targetPage, limit, searchValue)
          : `${fetchUrl}?page=${targetPage}&limit=${limit}&search=${encodeURIComponent(searchValue)}`;

        const response = await fetch(query);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        const parsed = parseResponse(result);
        setData(parsed.items);
        setPagination(parsed.pagination);
        setPage(parsed.pagination.page);
        return parsed;
      } finally {
        setLoading(false);
        setPaginationLoading(false);
        setSearchLoading(false);
      }
    },
    [buildQuery, fetchUrl, limit, parseResponse]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (debouncedSearch !== search) {
      setSearchLoading(true);
    }

    fetchData(1, debouncedSearch).catch(console.error);
  }, [debouncedSearch, enabled, fetchData, search]);

  const handlePageChange = async (newPage: number) => {
    await fetchData(newPage, debouncedSearch, true);
  };

  const refresh = async () => {
    await fetchData(page, debouncedSearch);
  };

  return {
    data,
    pagination,
    loading,
    searchLoading,
    paginationLoading,
    search,
    setSearch,
    handlePageChange,
    refresh,
  };
}
