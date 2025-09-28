import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { OrdersResponse } from '../types/order';

export function useOrders(params: {
  page: number;
  limit: number;
  q?: string;
  status?: string;
}) {
  return useQuery<OrdersResponse>({
    queryKey: queryKeys.orders(params),
    queryFn: () => apiFetch(`/orders?${new URLSearchParams(params as any)}`),
    placeholderData: (previousData) => previousData, // Keep previous data during refetch
  });
}
