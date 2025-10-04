import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import db from './db.js';
import { appLogger } from './logger.js';
import { DatabaseError } from './errors.js';

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const customers = [
  'Dana',
  'Avi',
  'Noa',
  'Lior',
  'Maya',
  'Tamar',
  'Yossi',
  'Nadav',
];
const statuses = ['pending', 'approved', 'rejected', 'cancelled'];

async function seedDatabase() {
  try {
    appLogger.info('Starting database seeding...');

    // Clear existing data
    appLogger.info('Clearing existing data...');
    db.exec('DELETE FROM order_items; DELETE FROM orders;');

    // Prepare statements for better performance
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, customer, status, total_cents, created_at, is_approved, is_cancelled)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, sku, qty) VALUES (?, ?, ?, ?)
    `);

    // Begin transaction for better performance
    const insertManyOrders = db.transaction((orders) => {
      for (const order of orders) {
        insertOrder.run(...order.orderData);
        for (const item of order.items) {
          insertItem.run(...item);
        }
      }
    });

    // Generate orders data
    const orders = [];
    for (let i = 0; i < 100; i++) {
      const id = randomUUID();
      const customer =
        customers[randInt(0, customers.length - 1)] +
        ' ' +
        String.fromCharCode(65 + randInt(0, 25)) +
        '.';
      const total = randInt(1000, 25000);
      const createdAt = new Date(
        Date.now() - randInt(0, 60) * 86400000
      ).toISOString();

      // Generate realistic status distribution
      const statusIndex = randInt(0, 100);
      let status: string;
      let isApproved: number;
      let isCancelled: number;

      if (statusIndex < 60) {
        status = 'pending';
        isApproved = 0;
        isCancelled = 0;
      } else if (statusIndex < 85) {
        status = 'approved';
        isApproved = 1;
        isCancelled = 0;
      } else if (statusIndex < 95) {
        status = 'rejected';
        isApproved = 0;
        isCancelled = 0;
      } else {
        status = 'cancelled';
        isApproved = 0;
        isCancelled = 1;
      }

      const orderData = [
        id,
        customer,
        status,
        total,
        createdAt,
        isApproved,
        isCancelled,
      ];

      // Generate line items
      const itemCount = randInt(1, 6);
      const items = [];
      for (let j = 0; j < itemCount; j++) {
        items.push([
          randomUUID(),
          id,
          `SKU-${randInt(100, 999)}`,
          randInt(1, 10),
        ]);
      }

      orders.push({ orderData, items });
    }

    // Insert all data in a transaction
    appLogger.info('Inserting orders and line items...');
    insertManyOrders(orders);

    // Verify the data
    const orderCount = db
      .prepare('SELECT COUNT(*) as count FROM orders')
      .get() as { count: number };
    const itemCount = db
      .prepare('SELECT COUNT(*) as count FROM order_items')
      .get() as { count: number };

    appLogger.info('Database seeding completed successfully', {
      ordersCreated: orderCount.count,
      lineItemsCreated: itemCount.count,
      statusDistribution: {
        pending: db
          .prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?')
          .get('pending') as { count: number },
        approved: db
          .prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?')
          .get('approved') as { count: number },
        rejected: db
          .prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?')
          .get('rejected') as { count: number },
        cancelled: db
          .prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?')
          .get('cancelled') as { count: number },
      },
    });
  } catch (error) {
    const dbError = new DatabaseError(
      'seed_database',
      error instanceof Error ? error : new Error('Unknown seeding error')
    );

    appLogger.error('Database seeding failed', {
      error: dbError.toJSON(),
    });

    process.exit(1);
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    appLogger.info('Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    appLogger.fatal('Seeding process failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  });
