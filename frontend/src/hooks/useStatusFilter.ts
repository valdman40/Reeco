import { useSearchParams } from 'react-router-dom';

export function useStatusFilter() {
  const [params, set] = useSearchParams();
  const currentStatus = params.get('status') ?? '';

  const handleStatusChange = (value: string) => {
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    // Reset to first page when filtering
    params.set('page', '1');
    set(params);
  };

  const statuses = [
    { value: '', label: 'All Statuses', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' },
  ];

  const currentStatusObject = statuses.find((s) => s.value === currentStatus) || statuses[0];

  return {
    currentStatus,
    currentStatusObject,
    statuses,
    handleStatusChange,
  };
}
