import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { HttpError } from './errors.js';
import { ZodError } from 'zod';
import {
  listQuerySchema,
  idParamSchema,
  patchBodySchema,
} from './validation.js';
import {
  getOrdersCount,
  listOrders,
  getOrder,
  patchOrder,
  cancelOrder,
} from './orders.repo.js';

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Custom request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Log incoming request
  console.log(`[DEBUG] ${req.method} ${req.url} (start)`);

  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && Object.keys(req.body || {}).length > 0) {
    console.log(`[DEBUG] Request body:`, JSON.stringify(req.body, null, 2));
  }

  // Log query parameters if present
  if (Object.keys(req.query).length > 0) {
    console.log(`[DEBUG] Query params:`, JSON.stringify(req.query));
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - start;
    console.log(
      `[DEBUG] ${req.method} ${req.url} - ${res.statusCode} (end) - ${duration}ms`
    );

    // Log response data for errors or if it's small
    if (res.statusCode >= 400 || JSON.stringify(data).length < 500) {
      console.log(`[DEBUG] Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(
        `[DEBUG] Response: [Large response - ${
          JSON.stringify(data).length
        } chars]`
      );
    }

    return originalJson.call(this, data);
  };

  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/orders', (req, res, next) => {
  try {
    const { page, limit, q, status } = listQuerySchema.parse(req.query);
    const items = listOrders({ page, limit, q, status });
    const total = getOrdersCount({ q, status });
    res.json({ items: items.map(mapRow), page, limit, total });
  } catch (e) {
    next(e);
  }
});

app.get('/orders/:id', (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const row = getOrder(id);
    if (!row) throw new HttpError(404, 'Not found');
    res.json(mapRow(row));
  } catch (e) {
    next(e);
  }
});

app.patch('/orders/:id', (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const body = patchBodySchema.parse(req.body);

    let ok: boolean;
    if (body.isCancelled !== undefined) {
      if (!body.isCancelled) {
        res
          .status(400)
          .json({ message: 'isCancelled must be true when provided' });
        return;
      }
      ok = cancelOrder(id);
    } else if (body.isApproved !== undefined) {
      ok = patchOrder(id, body.isApproved);
    } else {
      res
        .status(400)
        .json({ message: 'Either isApproved or isCancelled must be provided' });
      return;
    }

    if (!ok) throw new HttpError(404, 'Not found');
    res.json({ ok: true });
  } catch (e: any) {
    if (e instanceof ZodError) {
      // Caught a Zod validation error - respond with 400 BE-3
      res.status(400).json({ message: 'validation failed', error: e });
      return;
    }
    next(e);
  }
});

// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'internal error' });
});

function mapRow(row: any) {
  return {
    id: row.id,
    customer: row.customer,
    status: row.status,
    total: row.total_cents / 100,
    createdAt: row.created_at,
    isApproved: !!row.is_approved,
    isCancelled: !!row.is_cancelled,
    lineItemCount: row.lineItemCount ?? undefined,
  };
}

const port = process.env.PORT ?? 3001;
app.listen(port, () => {
  console.log(`Node backend listening on :${port}`);
});
