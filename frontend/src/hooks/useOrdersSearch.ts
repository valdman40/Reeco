import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { OrdersResponse } from '../types/order';
import { useDebounce } from './useDebounce';

/**
 * Custom hook that debounces search queries at the data layer
 * Similar to Redux-Saga's delay pattern but using React Query
 */
export function useOrdersSearch(params: {
  page: number;
  limit: number;
  q?: string;
  status?: string;
}) {
  // Debounce the search term only, not other params
  const debouncedQuery = useDebounce(params.q || '', 300);

  // Create stable params object with debounced query
  const searchParams = {
    ...params,
    q: debouncedQuery,
  };

  return useQuery<OrdersResponse>({
    queryKey: queryKeys.orders(searchParams),
    queryFn: () =>
      apiFetch(`/orders?${new URLSearchParams(searchParams as any)}`),
    // Only enable query if we have meaningful search params
    enabled: debouncedQuery.length >= 2 || !params.q, // Search only if 2+ chars or no search
  });
}
