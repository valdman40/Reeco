import { randomUUID } from 'node:crypto';
import db from './db.js';

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const customers = ['Dana', 'Avi', 'Noa', 'Lior', 'Maya', 'Tamar', 'Yossi', 'Nadav'];

// wipe
db.exec('DELETE FROM order_items; DELETE FROM orders;');

const insertOrder = db.prepare(`INSERT INTO orders (id, customer, status, total_cents, created_at, is_approved)
VALUES (?,?,?,?,?,?)`);
const insertItem = db.prepare(`INSERT INTO order_items (id, order_id, sku, qty) VALUES (?,?,?,?)`);

for (let i = 0; i < 100; i++) {
  const id = randomUUID();
  const customer = customers[randInt(0, customers.length - 1)] + ' ' + String.fromCharCode(65 + randInt(0,25)) + '.';
  const total = randInt(1000, 25000);
  const createdAt = new Date(Date.now() - randInt(0, 60) * 86400000).toISOString();
  const isApproved = randInt(0,1);
  const status = isApproved ? 'approved' : 'pending';
  insertOrder.run(id, customer, status, total, createdAt, isApproved);
  const items = randInt(1, 6);
  for (let j = 0; j < items; j++) {
    insertItem.run(randomUUID(), id, `SKU-${randInt(100,999)}`, randInt(1,10));
  }
}

console.log('Seeded 100 orders.');
