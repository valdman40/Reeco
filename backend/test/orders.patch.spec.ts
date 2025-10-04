import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('PATCH /orders/:id', () => {
  let testOrderId: string;

  beforeAll(async () => {
    // Get a test order ID
    const listRes = await request(app).get('/orders?limit=1&status=pending');
    if (listRes.body.items.length > 0) {
      testOrderId = listRes.body.items[0].id;
    }
  });

  it('validates request body - should reject invalid boolean', async () => {
    const res = await request(app)
      .patch('/orders/00000000-0000-0000-0000-000000000000')
      .send({ isApproved: 'yes' }); // Invalid boolean

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(res.body.error.validationDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'isApproved',
          message: expect.stringContaining('boolean'),
        }),
      ])
    );
  });

  it('validates UUID format in path parameter', async () => {
    const res = await request(app)
      .patch('/orders/invalid-uuid')
      .send({ isApproved: true });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('requires either isApproved or isCancelled but not both', async () => {
    const res = await request(app)
      .patch('/orders/00000000-0000-0000-0000-000000000000')
      .send({ isApproved: true, isCancelled: true });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('requires at least one field to be provided', async () => {
    const res = await request(app)
      .patch('/orders/00000000-0000-0000-0000-000000000000')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('validates that isCancelled must be true when provided', async () => {
    const res = await request(app)
      .patch('/orders/00000000-0000-0000-0000-000000000000')
      .send({ isCancelled: false });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('returns 404 for non-existent order', async () => {
    const res = await request(app)
      .patch('/orders/12345678-1234-5678-9abc-123456789abc')
      .send({ isApproved: true });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'ORDER_NOT_FOUND');
  });

  it('successfully approves a pending order', async () => {
    if (!testOrderId) {
      console.log('Skipping test - no pending orders available');
      return;
    }

    const res = await request(app)
      .patch(`/orders/${testOrderId}`)
      .send({ isApproved: true });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('correlationId');
    expect(res.headers).toHaveProperty('x-correlation-id');
  });

  it('prevents modifying non-pending orders', async () => {
    // First, get an approved order
    const listRes = await request(app).get('/orders?status=approved&limit=1');

    if (listRes.body.items.length === 0) {
      console.log('Skipping test - no approved orders available');
      return;
    }

    const approvedOrderId = listRes.body.items[0].id;

    const res = await request(app)
      .patch(`/orders/${approvedOrderId}`)
      .send({ isApproved: false });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'INVALID_ORDER_STATUS');
  });

  it('includes correlation ID in error responses', async () => {
    const res = await request(app)
      .patch('/orders/00000000-0000-0000-0000-000000000000')
      .send({ isApproved: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('correlationId');
    expect(res.headers).toHaveProperty('x-correlation-id');
  });
});
