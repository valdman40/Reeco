import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export function useApproveOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => {
      console.log('🚀 Starting approval mutation:', { id, isApproved });
      return apiFetch(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isApproved }),
      });
    },
    onSettled: (_data, _error, variables) => {
      // Invalidate and refetch orders list and individual order queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}
