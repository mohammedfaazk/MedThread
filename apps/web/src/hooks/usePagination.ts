import { useState, useCallback } from 'react';
import axios from 'axios';

interface PaginationState<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UsePaginationOptions {
  endpoint: string;
  limit?: number;
  params?: Record<string, any>;
}

export function usePagination<T>({
  endpoint,
  limit = 20,
  params = {},
}: UsePaginationOptions) {
  const [state, setState] = useState<PaginationState<T>>({
    data: [],
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
    isLoading: false,
    error: null,
  });

  const fetchPage = useCallback(
    async (page: number, append = false) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await axios.get(endpoint, {
          params: {
            page,
            limit,
            ...params,
          },
        });

        const { data, pagination } = response.data;

        setState((prev) => ({
          ...prev,
          data: append ? [...prev.data, ...data] : data,
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages,
          hasNext: pagination.hasNext,
          hasPrev: pagination.hasPrev,
          isLoading: false,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.response?.data?.error || 'Failed to fetch data',
        }));
      }
    },
    [endpoint, limit, params]
  );

  const loadMore = useCallback(() => {
    if (state.hasNext && !state.isLoading) {
      fetchPage(state.page + 1, true);
    }
  }, [state.hasNext, state.isLoading, state.page, fetchPage]);

  const refresh = useCallback(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const goToPage = useCallback(
    (page: number) => {
      fetchPage(page, false);
    },
    [fetchPage]
  );

  return {
    ...state,
    loadMore,
    refresh,
    goToPage,
    fetchPage,
  };
}
