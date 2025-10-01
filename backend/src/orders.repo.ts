import db from './db.js';

export type OrderRow = {
  id: string;
  customer: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  total_cents: number;
  created_at: string;
  is_approved: 0 | 1;
  is_cancelled: 0 | 1;
};

export function getOrdersCount(filter: { q?: string; status?: string }) {
  let sql = 'SELECT COUNT(*) as cnt FROM orders WHERE 1=1';
  const params: any[] = [];
  if (filter.q) {
    sql += ' AND (customer LIKE ? OR id LIKE ?)';
    params.push(`%${filter.q}%`, `%${filter.q}%`);
  }
  if (filter.status) {
    sql += ' AND status = ?';
    params.push(filter.status);
  }
  const row = db.prepare(sql).get(...params) as { cnt: number };
  return row.cnt;
}

export function listOrders(filter: {
  q?: string;
  status?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = filter;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];
  if (filter.q) {
    sql += ' AND (customer LIKE ? OR id LIKE ?)';
    params.push(`%${filter.q}%`, `%${filter.q}%`);
  }
  if (filter.status) {
    sql += ' AND status = ?';
    params.push(filter.status);
  }
  // Add sorting
  const validSortColumns = ['created_at', 'total_cents', 'customer', 'status'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  if (sortColumn === 'created_at') {
    sql += ` ORDER BY datetime(${sortColumn}) ${order}`;
  } else {
    sql += ` ORDER BY ${sortColumn} ${order}`;
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params) as OrderRow[];

  return rows.map((r) => ({
    id: r.id,
    customer: r.customer,
    status: r.status,
    total_cents: r.total_cents,
    created_at: r.created_at,
    is_approved: r.is_approved,
    is_cancelled: r.is_cancelled,
  }));
}

export function getOrder(id: string) {
  const row = db
    .prepare(
      `SELECT o.*, COUNT(oi.id) as lineItemCount FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.id = ? GROUP BY o.id `
    )
    .get(id) as (OrderRow & { lineItemCount: number }) | undefined;
  return row ?? null;
}

export function patchOrder(id: string, isApproved: boolean) {
  const res = db
    .prepare('UPDATE orders SET is_approved = ? , status = ? WHERE id = ?')
    .run(isApproved ? 1 : 0, isApproved ? 'approved' : 'pending', id);
  return res.changes > 0;
}

export function cancelOrder(id: string) {
  const res = db
    .prepare(
      'UPDATE orders SET is_cancelled = 1, status = ? WHERE id = ? AND is_cancelled = 0'
    )
    .run('cancelled', id);
  return res.changes > 0;
}
