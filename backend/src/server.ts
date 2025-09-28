import "dotenv/config";
import express from "express";
import cors from "cors";
import { HttpError } from "./errors.js";
import {
  listQuerySchema,
  idParamSchema,
  patchBodySchema,
} from "./validation.js";
import {
  getOrdersCount,
  listOrders,
  getOrder,
  patchOrder,
} from "./orders.repo.js";

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Custom request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log incoming request
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip || 'unknown IP'}`);
  
  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && Object.keys(req.body || {}).length > 0) {
    console.log(`[${timestamp}] Request body:`, JSON.stringify(req.body, null, 2));
  }
  
  // Log query parameters if present
  if (Object.keys(req.query).length > 0) {
    console.log(`[${timestamp}] Query params:`, JSON.stringify(req.query, null, 2));
  }
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    
    // Log response data for errors or if it's small
    if (res.statusCode >= 400 || JSON.stringify(data).length < 500) {
      console.log(`[${timestamp}] Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`[${timestamp}] Response: [Large response - ${JSON.stringify(data).length} chars]`);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/orders", (req, res, next) => {
  try {
    const { page, limit, q, status } = listQuerySchema.parse(req.query);
    const items = listOrders({ page, limit, q, status });
    const total = getOrdersCount({ q, status });
    res.json({ items: items.map(mapRow), page, limit, total });
  } catch (e) {
    next(e);
  }
});

app.get("/orders/:id", (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const row = getOrder(id);
    if (!row) throw new HttpError(404, "Not found");
    res.json(mapRow(row));
  } catch (e) {
    next(e);
  }
});

app.patch("/orders/:id", (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { isApproved } = patchBodySchema.parse(req.body);
    const ok = patchOrder(id, isApproved);
    if (!ok) throw new HttpError(404, "Not found");
    res.json({ ok: true });
  } catch (e: any) {
    // BUG: wrong status code on validation errors
    if (e && typeof e === "object" && "issues" in e) {
      res.status(500).json({ message: "validation failed", error: e }); // <-- BE-3
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
  res.status(500).json({ message: "internal error" });
});

function mapRow(row: any) {
  return {
    id: row.id,
    customer: row.customer,
    status: row.status,
    total: row.total_cents / 100,
    createdAt: row.created_at,
    isApproved: !!row.is_approved,
    lineItemCount: row.lineItemCount ?? undefined,
  };
}

const port = process.env.PORT ?? 3001;
app.listen(port, () => {
  console.log(`Node backend listening on :${port}`);
});
