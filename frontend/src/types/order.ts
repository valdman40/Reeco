export type Status = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type Order = {
  id: string;
  customer: string;
  status: Status;
  total: number;
  createdAt: string;
  isApproved: boolean;
  isCancelled: boolean;
  lineItemCount?: number;
};
export type OrdersResponse = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
};
