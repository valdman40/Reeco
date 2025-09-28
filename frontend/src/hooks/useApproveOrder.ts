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
    onSuccess: (data, variables) => {
      console.log('✅ Approval successful!', { data, variables });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error, variables) => {
      console.error('❌ Approval failed!', { error, variables });
    },
  });
}
