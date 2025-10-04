import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('Health Check and Monitoring', () => {
  describe('GET /health', () => {
    it('returns health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('checks');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(res.body.status);
      expect(Array.isArray(res.body.checks)).toBe(true);

      // Check individual health checks
      const checkNames = res.body.checks.map((check: any) => check.name);
      expect(checkNames).toContain('database');
      expect(checkNames).toContain('disk_space');
      expect(checkNames).toContain('memory');
    });

    it('includes database health check', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      const dbCheck = res.body.checks.find(
        (check: any) => check.name === 'database'
      );
      expect(dbCheck).toBeDefined();
      expect(dbCheck).toHaveProperty('status');
      expect(dbCheck).toHaveProperty('message');
      expect(dbCheck).toHaveProperty('duration');
      expect(dbCheck).toHaveProperty('timestamp');
    });
  });

  describe('GET /metrics', () => {
    it('returns metrics when enabled', async () => {
      const res = await request(app).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('httpRequests');
      expect(res.body).toHaveProperty('responseTimes');
      expect(res.body).toHaveProperty('errors');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('system');
      expect(res.body).toHaveProperty('timestamp');

      // Check HTTP metrics structure
      expect(res.body.httpRequests).toHaveProperty('total');
      expect(res.body.httpRequests).toHaveProperty('byStatus');
      expect(res.body.httpRequests).toHaveProperty('byMethod');
      expect(res.body.httpRequests).toHaveProperty('byPath');

      // Check response time metrics
      expect(res.body.responseTimes).toHaveProperty('count');
      expect(res.body.responseTimes).toHaveProperty('avg');
      expect(res.body.responseTimes).toHaveProperty('min');
      expect(res.body.responseTimes).toHaveProperty('max');
    });
  });

  describe('Error Handling', () => {
    it('returns proper error structure for 404', async () => {
      const res = await request(app).get('/nonexistent-route');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code', 'ROUTE_NOT_FOUND');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error).toHaveProperty('correlationId');
      expect(res.body.error).toHaveProperty('timestamp');
    });

    it('includes correlation ID in all error responses', async () => {
      const res = await request(app)
        .patch('/orders/invalid')
        .send({ invalid: 'data' });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('correlationId');
      expect(res.headers).toHaveProperty('x-correlation-id');
    });
  });

  describe('Security Headers', () => {
    it('includes security headers in responses', async () => {
      const res = await request(app).get('/health');

      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(res.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(res.headers).toHaveProperty('strict-transport-security');
      expect(res.headers).toHaveProperty('content-security-policy');
    });

    it('includes CORS headers', async () => {
      const res = await request(app)
        .get('/orders')
        .set('Origin', 'http://localhost:5173');

      expect(res.headers).toHaveProperty('access-control-allow-origin');
      expect(res.headers).toHaveProperty(
        'access-control-allow-credentials',
        'true'
      );
    });
  });

  describe('Request Processing', () => {
    it('handles compressed responses', async () => {
      const res = await request(app)
        .get('/orders?limit=50')
        .set('Accept-Encoding', 'gzip');

      expect(res.status).toBe(200);
      // Supertest automatically handles decompression
      expect(res.body).toHaveProperty('items');
    });

    it('validates content type for POST/PATCH requests', async () => {
      const res = await request(app)
        .patch('/orders/12345678-1234-5678-9abc-123456789abc')
        .send('invalid json');

      expect([400, 404]).toContain(res.status);
    });
  });
});
