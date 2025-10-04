import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { serverConfig, monitoringConfig, isDevelopment } from './config.js';
import { appLogger, httpLogger, correlationMiddleware } from './logger.js';
import {
  BaseError,
  HttpError,
  ValidationError,
  BusinessError,
  DatabaseError,
  ErrorFactory,
} from './errors.js';

// Security middleware
import {
  createRateLimiter,
  securityHeaders,
  corsMiddleware,
  compressionMiddleware,
  requestSizeLimiter,
  sanitizeInput,
  securityEventLogger,
} from './middleware/security.js';

// Validation middleware
import {
  validateListQuery,
  validateIdParam,
  validatePatchBody,
  validateOrderStatus,
} from './middleware/validation.js';

// Monitoring middleware
import {
  requestMetrics,
  healthCheckHandler,
  metricsHandler,
  errorTracker,
} from './middleware/monitoring.js';

// Repository
import {
  getOrdersCount,
  listOrders,
  getOrder,
  updateOrderApproval,
  cancelOrder,
  OrderRow,
} from './orders.repo.js';

// Create Express application
const app = express();

// Trust proxy if configured (for rate limiting, IP detection)
if (serverConfig.trustProxy) {
  app.set('trust proxy', 1);
}

// Apply security middleware first
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(createRateLimiter());

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(requestSizeLimiter);

// Logging and correlation
app.use(httpLogger);
app.use(correlationMiddleware);

// Security event logging
app.use(securityEventLogger);

// Input sanitization
app.use(sanitizeInput);

// Request metrics
if (monitoringConfig.enableMetrics) {
  app.use(requestMetrics);
}

// Health check endpoint (before auth/validation for monitoring)
app.get(monitoringConfig.healthCheckPath, healthCheckHandler);

// Metrics endpoint
if (monitoringConfig.enableMetrics) {
  app.get(monitoringConfig.metricsPath, metricsHandler);
}

// API Routes
app.get(
  '/orders',
  validateListQuery,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = (req as any).logger;
      const correlationId = (req as any).correlationId;
      const errorFactory = new ErrorFactory(correlationId);

      // Get validated query parameters
      const query = (req as any).validatedQuery;
      const { page, limit, q, status, sortBy, sortOrder } = query;

      logger.info('Listing orders', {
        page,
        limit,
        searchQuery: q,
        status,
        sortBy,
        sortOrder,
      });

      const [items, total] = await Promise.all([
        listOrders({ page, limit, q, status, sortBy, sortOrder }),
        getOrdersCount({ q, status }),
      ]);

      const response = {
        items: items.map(mapOrderRow),
        page,
        limit,
        total,
        hasMore: page * limit < total,
      };

      logger.info('Orders retrieved successfully', {
        count: items.length,
        total,
        hasMore: response.hasMore,
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

app.get(
  '/orders/:id',
  validateIdParam,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = (req as any).logger;
      const correlationId = (req as any).correlationId;
      const { id } = req.params;

      logger.info('Retrieving order', { orderId: id });

      const order = getOrder(id, correlationId);
      const mappedOrder = mapOrderRow(order);

      logger.info('Order retrieved successfully', {
        orderId: id,
        status: order.status,
        lineItemCount: order.lineItemCount,
      });

      res.json(mappedOrder);
    } catch (error) {
      next(error);
    }
  }
);

app.patch(
  '/orders/:id',
  validateIdParam,
  validatePatchBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = (req as any).logger;
      const correlationId = (req as any).correlationId;
      const errorFactory = new ErrorFactory(correlationId);
      const { id } = req.params;
      const body = req.body;

      logger.info('Updating order', {
        orderId: id,
        action: body.isApproved !== undefined ? 'approval' : 'cancellation',
        value: body.isApproved ?? body.isCancelled,
      });

      // Get current order to validate status transition
      const currentOrder = getOrder(id, correlationId);

      if (body.isCancelled !== undefined) {
        // Validate cancellation
        const validation = validateOrderStatus(currentOrder.status, 'cancel');
        if (!validation.isValid) {
          throw errorFactory.createInvalidOrderStatusError(
            id,
            currentOrder.status,
            'cancel'
          );
        }

        cancelOrder(id, correlationId);

        logger.info('Order cancelled successfully', { orderId: id });
      } else if (body.isApproved !== undefined) {
        // Validate approval/rejection
        const action = body.isApproved ? 'approve' : 'reject';
        const validation = validateOrderStatus(currentOrder.status, action);
        if (!validation.isValid) {
          throw errorFactory.createInvalidOrderStatusError(
            id,
            currentOrder.status,
            action
          );
        }

        updateOrderApproval(id, body.isApproved, correlationId);

        logger.info('Order approval updated successfully', {
          orderId: id,
          isApproved: body.isApproved,
        });
      }

      res.json({
        success: true,
        message: 'Order updated successfully',
        correlationId,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 404 handler for undefined routes
app.use('*', (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;
  const logger = (req as any).logger;

  logger.warn('Route not found', {
    method: req.method,
    path: req.originalUrl,
  });

  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      correlationId,
      timestamp: new Date().toISOString(),
    },
  });
});

// Error tracking middleware
app.use(errorTracker);

// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req as any).correlationId;
  const logger = (req as any).logger;

  // Handle our custom errors
  if (error instanceof BaseError) {
    const statusCode = error.getHttpStatus();

    logger.warn('Business error occurred', {
      error: error.toJSON(),
      statusCode,
    });

    return res.status(statusCode).json({
      error: error.toJSON(),
    });
  }

  // Handle unexpected errors
  logger.error('Unexpected error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: isDevelopment() ? error.stack : undefined,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
    },
  });

  const errorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDevelopment() ? error.message : 'An unexpected error occurred',
      correlationId,
      timestamp: new Date().toISOString(),
      ...(isDevelopment() && { stack: error.stack }),
    },
  };

  res.status(500).json(errorResponse);
});

// Order row mapper
function mapOrderRow(row: OrderRow & { lineItemCount?: number }) {
  return {
    id: row.id,
    customer: row.customer,
    status: row.status,
    total: row.total_cents / 100,
    createdAt: row.created_at,
    isApproved: !!row.is_approved,
    isCancelled: !!row.is_cancelled,
    ...(row.lineItemCount !== undefined && {
      lineItemCount: row.lineItemCount,
    }),
  };
}

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  appLogger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new requests if server is running
  if (server) {
    server.close((err: any) => {
      if (err) {
        appLogger.error('Error during server shutdown', { error: err.message });
        process.exit(1);
      }

      appLogger.info('Server closed successfully');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      appLogger.error('Force shutdown after 30 seconds');
      process.exit(1);
    }, 30000);
  } else {
    // In test mode, just exit gracefully
    appLogger.info('Graceful shutdown completed (test mode)');
    process.exit(0);
  }
};

// Start server only if not in test mode or if explicitly requested
let server: any;

if (serverConfig.nodeEnv !== 'test') {
  server = app.listen(serverConfig.port, serverConfig.host, () => {
    appLogger.info('🚀 Server started successfully', {
      port: serverConfig.port,
      host: serverConfig.host,
      nodeEnv: serverConfig.nodeEnv,
      healthCheck: monitoringConfig.healthCheckPath,
      metrics: monitoringConfig.enableMetrics
        ? monitoringConfig.metricsPath
        : 'disabled',
    });
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    appLogger.fatal('Uncaught exception', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    appLogger.fatal('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : reason,
      promise: promise.toString(),
    });
    process.exit(1);
  });
}

export default app;
