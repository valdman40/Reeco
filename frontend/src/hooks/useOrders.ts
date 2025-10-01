import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { OrdersResponse } from '../types/order';

export function useOrders(params: { page: number; limit: number; q?: string; status?: string; sort?: string }) {
  return useQuery<OrdersResponse>({
    queryKey: queryKeys.orders(params),
    retry: 1,
    retryDelay: 100,
    queryFn: () => {
      // Clean params to avoid "undefined" strings in URL
      const cleanParams = new URLSearchParams();
      cleanParams.set('page', params.page.toString());
      cleanParams.set('limit', params.limit.toString());
      if (params.q) cleanParams.set('q', params.q);
      if (params.status) cleanParams.set('status', params.status);
      if (params.sort) cleanParams.set('sort', params.sort);

      const url = `/orders?${cleanParams.toString()}`;
      console.log('🔧 API Request:', url);

      return apiFetch(url);
    },
    placeholderData: (previousData) => previousData, // Keep previous data during refetch
  });
}
