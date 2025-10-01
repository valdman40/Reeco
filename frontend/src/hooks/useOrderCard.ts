import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApproveOrder } from './useApproveOrder';
import { getStatusConfig } from '../utils/statusConfig';
import { Order } from '../types/order';

export function useOrderCard(order: Order) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const approve = useApproveOrder();

  const handleOrderNavigation = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('id', order.id);
    navigate(`/orders?${newParams.toString()}`);
  };

  const handleApprove = () => {
    approve.mutate({ id: order.id, isApproved: true });
  };

  const statusConfig = getStatusConfig(order.status);
  const isCancelled = order.status === 'cancelled';
  const cardOpacity = isCancelled ? 0.5 : 1;
  const isPending = order.status === 'pending';

  return {
    // Navigation
    handleOrderNavigation,

    // Approval logic
    handleApprove,
    isApproving: approve.isPending,

    // Status logic
    statusConfig,
    isCancelled,
    cardOpacity,
    isPending,
  };
}
