import db from './db.js';
import { withDatabaseMetrics } from './middleware/monitoring.js';
import { DatabaseError, OrderNotFoundError, ErrorFactory } from './errors.js';
import { appLogger } from './logger.js';

export type OrderRow = {
  id: string;
  customer: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  total_cents: number;
  created_at: string;
  is_approved: 0 | 1;
  is_cancelled: 0 | 1;
};

export type OrderFilter = {
  q?: string;
  status?: string;
};

export type OrderListOptions = OrderFilter & {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
};

export function getOrdersCount(filter: OrderFilter): number {
  return withDatabaseMetrics('count_orders', () => {
    try {
      let sql = 'SELECT COUNT(*) as cnt FROM orders WHERE 1=1';
      const params: any[] = [];

      if (filter.q) {
        sql += ' AND (customer LIKE ? OR id LIKE ?)';
        const searchTerm = `%${filter.q}%`;
        params.push(searchTerm, searchTerm);
      }

      if (filter.status) {
        sql += ' AND status = ?';
        params.push(filter.status);
      }

      const row = db.prepare(sql).get(...params) as { cnt: number };

      appLogger.debug('Orders count query executed', {
        sql,
        params,
        result: row.cnt,
        component: 'repository',
      });

      return row.cnt;
    } catch (error) {
      const dbError = new DatabaseError(
        'count_orders',
        error instanceof Error ? error : new Error('Unknown database error'),
        'SELECT COUNT(*) FROM orders'
      );
      appLogger.error('Failed to count orders', { error: dbError.toJSON() });
      throw dbError;
    }
  });
}

export function listOrders(options: OrderListOptions): OrderRow[] {
  return withDatabaseMetrics('list_orders', () => {
    try {
      const {
        page,
        limit,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = options;
      const offset = (page - 1) * limit;

      let sql = 'SELECT * FROM orders WHERE 1=1';
      const params: any[] = [];

      if (options.q) {
        sql += ' AND (customer LIKE ? OR id LIKE ?)';
        const searchTerm = `%${options.q}%`;
        params.push(searchTerm, searchTerm);
      }

      if (options.status) {
        sql += ' AND status = ?';
        params.push(options.status);
      }

      // Sorting is now validated in the middleware layer
      // Repository trusts the validated input
      if (sortBy === 'created_at') {
        sql += ` ORDER BY datetime(${sortBy}) ${sortOrder.toUpperCase()}`;
      } else {
        sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      }

      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rows = db.prepare(sql).all(...params) as OrderRow[];

      appLogger.debug('Orders list query executed', {
        sql,
        params,
        resultCount: rows.length,
        component: 'repository',
      });

      return rows;
    } catch (error) {
      const dbError = new DatabaseError(
        'list_orders',
        error instanceof Error ? error : new Error('Unknown database error'),
        'SELECT * FROM orders'
      );
      appLogger.error('Failed to list orders', { error: dbError.toJSON() });
      throw dbError;
    }
  });
}

export function getOrder(
  id: string,
  correlationId?: string
): OrderRow & { lineItemCount: number } {
  return withDatabaseMetrics('get_order', () => {
    try {
      const sql = `
        SELECT o.*, COUNT(oi.id) as lineItemCount 
        FROM orders o 
        LEFT JOIN order_items oi ON o.id = oi.order_id 
        WHERE o.id = ? 
        GROUP BY o.id
      `;

      const row = db.prepare(sql).get(id) as
        | (OrderRow & { lineItemCount: number })
        | undefined;

      if (!row) {
        throw new OrderNotFoundError(id, correlationId);
      }

      appLogger.debug('Order retrieved', {
        orderId: id,
        correlationId,
        component: 'repository',
      });

      return row;
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw error;
      }

      const dbError = new DatabaseError(
        'get_order',
        error instanceof Error ? error : new Error('Unknown database error'),
        'SELECT orders with line items'
      );
      appLogger.error('Failed to get order', {
        orderId: id,
        error: dbError.toJSON(),
        correlationId,
      });
      throw dbError;
    }
  });
}

export function updateOrderApproval(
  id: string,
  isApproved: boolean,
  correlationId?: string
): boolean {
  return withDatabaseMetrics('update_order_approval', () => {
    try {
      const sql = 'UPDATE orders SET is_approved = ?, status = ? WHERE id = ?';
      const status = isApproved ? 'approved' : 'pending';
      const params = [isApproved ? 1 : 0, status, id];

      const result = db.prepare(sql).run(...params);

      if (result.changes === 0) {
        throw new OrderNotFoundError(id, correlationId);
      }

      appLogger.info('Order approval updated', {
        orderId: id,
        isApproved,
        status,
        correlationId,
        component: 'repository',
      });

      return true;
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw error;
      }

      const dbError = new DatabaseError(
        'update_order_approval',
        error instanceof Error ? error : new Error('Unknown database error'),
        'UPDATE orders SET is_approved'
      );
      appLogger.error('Failed to update order approval', {
        orderId: id,
        isApproved,
        error: dbError.toJSON(),
        correlationId,
      });
      throw dbError;
    }
  });
}

export function cancelOrder(id: string, correlationId?: string): boolean {
  return withDatabaseMetrics('cancel_order', () => {
    try {
      const sql =
        'UPDATE orders SET is_cancelled = 1, status = ? WHERE id = ? AND is_cancelled = 0';
      const params = ['cancelled', id];

      const result = db.prepare(sql).run(...params);

      if (result.changes === 0) {
        // Check if order exists but is already cancelled
        const existingOrder = db
          .prepare('SELECT id, is_cancelled FROM orders WHERE id = ?')
          .get(id) as { id: string; is_cancelled: number } | undefined;

        if (!existingOrder) {
          throw new OrderNotFoundError(id, correlationId);
        }

        if (existingOrder.is_cancelled === 1) {
          const errorFactory = new ErrorFactory(correlationId);
          throw errorFactory.createOrderAlreadyProcessedError(id, 'cancelled');
        }

        throw new OrderNotFoundError(id, correlationId);
      }

      appLogger.info('Order cancelled', {
        orderId: id,
        correlationId,
        component: 'repository',
      });

      return true;
    } catch (error) {
      if (
        error instanceof OrderNotFoundError ||
        (error instanceof Error &&
          error.constructor.name.includes('BusinessError'))
      ) {
        throw error;
      }

      const dbError = new DatabaseError(
        'cancel_order',
        error instanceof Error ? error : new Error('Unknown database error'),
        'UPDATE orders SET is_cancelled'
      );
      appLogger.error('Failed to cancel order', {
        orderId: id,
        error: dbError.toJSON(),
        correlationId,
      });
      throw dbError;
    }
  });
}
