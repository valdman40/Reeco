import db from './db.js';

export type OrderRow = {
  id: string;
  customer: string;
  status: 'pending' | 'approved' | 'rejected';
  total_cents: number;
  created_at: string;
  is_approved: 0 | 1;
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
}) {
  const { page, limit } = filter;
  const offset = (page - 1) * limit; // <-- BE-1

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
  sql += ' ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params) as OrderRow[];

  // N+1 smell: count items per order one-by-one (inefficient)
  const itemStmt = db.prepare(
    'SELECT COUNT(*) as c FROM order_items WHERE order_id = ?'
  );
  const withCounts = rows.map((r) => ({
    id: r.id,
    customer: r.customer,
    status: r.status,
    total_cents: r.total_cents,
    created_at: r.created_at,
    is_approved: r.is_approved,
    lineItemCount: (itemStmt.get(r.id) as any).c as number, // <-- BE-2
  }));

  return withCounts;
}

export function getOrder(id: string) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as
    | OrderRow
    | undefined;
  return row ?? null;
}

export function patchOrder(id: string, isApproved: boolean) {
  const res = db
    .prepare('UPDATE orders SET is_approved = ? , status = ? WHERE id = ?')
    .run(isApproved ? 1 : 0, isApproved ? 'approved' : 'pending', id);
  return res.changes > 0;
}
