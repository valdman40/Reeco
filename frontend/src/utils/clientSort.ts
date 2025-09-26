import { Order } from '../types/order';

export function sortOrders(items: Order[], sort: string) {
  const [f, d] = sort.split(':');
  const s = [...items].sort((a, b) =>
    f === 'total'
      ? a.total - b.total
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  if (d === 'desc') s.reverse();
  return s;
}
