import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import '../src/server.js'; // start app

const base = 'http://localhost:3001';

describe('GET /orders', () => {
  it('returns paginated list', async () => {
    const res = await request(base).get('/orders?page=1&limit=20');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(20);
    expect(res.body.total).toBeGreaterThan(20);
  });
});
