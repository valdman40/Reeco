export type Status = 'pending' | 'approved' | 'rejected';
export type Order = {
  id: string;
  customer: string;
  status: Status;
  total: number;
  createdAt: string;
  isApproved: boolean;
  lineItemCount?: number;
};
export type OrdersResponse = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
};
