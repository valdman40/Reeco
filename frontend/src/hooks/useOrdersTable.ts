import { useSearchParams } from 'react-router-dom';
import { useOrderSelection } from './useOrderSelection';
import { useCancelOrder } from './useCancelOrder';

export function useOrdersTable() {
  const [params, set] = useSearchParams();
  const selection = useOrderSelection();
  const cancelOrder = useCancelOrder();

  const sort = params.get('sort') ?? 'createdAt:desc';

  const handleSort = (field: string) => {
    const [currentField, currentDir] = sort.split(':');

    // If clicking the same field, toggle direction
    // If clicking a different field, start with desc (most common for totals/dates)
    const dir = currentField === field ? (currentDir === 'desc' ? 'asc' : 'desc') : 'desc';

    params.set('sort', `${field}:${dir}`);
    set(params);
  };

  const handleCancelSelected = () => {
    selection.selectedOrderIds.forEach((id) => {
      cancelOrder.mutate({ id });
    });
    selection.clearSelection();
  };

  return {
    // State
    sort,
    selection,

    // Actions
    handleSort,
    handleCancelSelected,

    // Loading states
    isCancelling: cancelOrder.isPending,
  };
}
