import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { Order } from '../types/order';

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      console.log('🚀 Starting cancellation mutation:', { id });
      return apiFetch(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCancelled: true }),
      });
    },

    // Optimistic update
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      await queryClient.cancelQueries({ queryKey: ['order', id] });

      // Snapshot the previous values
      const previousOrdersData = queryClient.getQueriesData({ queryKey: ['orders'] });
      const previousOrderData = queryClient.getQueryData(['order', id]);

      // Optimistically update orders list
      queryClient.setQueriesData({ queryKey: ['orders'] }, (old: any) => {
        if (!old) return old;

        // Handle different possible data structures
        if (old.items && Array.isArray(old.items)) {
          return {
            ...old,
            items: old.items.map((order: Order) =>
              order.id === id ? { ...order, status: 'cancelled' as const, isCancelled: true } : order
            ),
          };
        }

        // If it's just an array of orders
        if (Array.isArray(old)) {
          return old.map((order: Order) =>
            order.id === id ? { ...order, status: 'cancelled' as const, isCancelled: true } : order
          );
        }

        return old;
      });

      // Optimistically update individual order
      queryClient.setQueryData(['order', id], (old: Order | undefined) => {
        if (!old) return old;
        return { ...old, status: 'cancelled' as const, isCancelled: true };
      });

      // Return a context object with the snapshotted values
      return { previousOrdersData, previousOrderData, id };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, _variables, context) => {
      console.error('❌ Order cancellation failed:', err);

      if (context) {
        // Restore previous orders data
        context.previousOrdersData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });

        // Restore previous individual order data
        if (context.previousOrderData) {
          queryClient.setQueryData(['order', context.id], context.previousOrderData);
        }
      }
    },

    // Always refetch after error or success to ensure we have the latest data
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}
