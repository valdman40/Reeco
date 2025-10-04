import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('GET /orders', () => {
  it('returns paginated list with correct structure', async () => {
    const res = await request(app).get('/orders?page=1&limit=20');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 20);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('hasMore');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeLessThanOrEqual(20);

    // Check correlation ID header
    expect(res.headers).toHaveProperty('x-correlation-id');
  });

  it('respects pagination parameters', async () => {
    const res1 = await request(app).get('/orders?page=1&limit=5');
    const res2 = await request(app).get('/orders?page=2&limit=5');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.items.length).toBeLessThanOrEqual(5);
    expect(res2.body.items.length).toBeLessThanOrEqual(5);
    expect(res1.body.page).toBe(1);
    expect(res2.body.page).toBe(2);
  });

  it('handles search queries', async () => {
    const res = await request(app).get('/orders?q=Dana&limit=10');

    expect(res.status).toBe(200);
    expect(
      res.body.items.every(
        (item: any) =>
          item.customer.toLowerCase().includes('dana') ||
          item.id.includes('Dana')
      )
    );
  });

  it('handles status filtering', async () => {
    const res = await request(app).get('/orders?status=approved&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.items.every((item: any) => item.status === 'approved'));
  });

  it('validates pagination limits', async () => {
    const res = await request(app).get('/orders?page=0&limit=1000');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('handles sorting parameters', async () => {
    const res = await request(app).get('/orders?sort=customer:asc&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);

    // Check if sorted by customer name
    const customers = res.body.items.map((item: any) => item.customer);
    const sortedCustomers = [...customers].sort();
    expect(customers).toEqual(sortedCustomers);
  });

  it('rejects invalid sort parameters', async () => {
    const res = await request(app).get('/orders?sort=invalid:asc');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('includes proper security headers', async () => {
    const res = await request(app).get('/orders');

    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-frame-options', 'DENY');
    expect(res.headers).toHaveProperty('x-xss-protection', '0');
  });
});
