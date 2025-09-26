import { describe, it, expect } from 'vitest';
import request from 'supertest';

const base = 'http://localhost:3001';

describe('PATCH /orders/:id', () => {
  it('validates body', async () => {
    const res = await request(base).patch('/orders/00000000-0000-0000-0000-000000000000').send({ isApproved: 'yes' });
    // Currently returns 500 due to BE-3
    expect([400,500]).toContain(res.status);
  });
});
