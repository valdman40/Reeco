import { Status } from '../../types/order';
import { getStatusConfig } from '../../utils/statusConfig';

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = getStatusConfig(status);

  return (
    <span className={`${statusConfig.badgeClass}`}>
      {statusConfig.icon}
      <span style={{ textTransform: 'capitalize' }}>{status}</span>
    </span>
  );
}