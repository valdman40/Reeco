import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { Order } from '../types/order';

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: queryKeys.order(id),
    queryFn: () => apiFetch(`/orders/${id}`),
  });
}
