import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { loggingConfig, isDevelopment } from './config.js';

// Create base logger
const logger = pino({
  level: loggingConfig.level,
  ...(isDevelopment() &&
    loggingConfig.pretty && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }),
  base: {
    service: 'orders-api',
    version: process.env.npm_package_version || '0.1.0',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// HTTP request logger middleware
export const httpLogger = pinoHttp({
  logger,
  genReqId: () => randomUUID(),
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'info';
    }
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${res.responseTime}ms`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${res.responseTime}ms - Error: ${err.message}`;
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
        authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.getHeader
          ? res.getHeader('content-type')
          : undefined,
        'content-length': res.getHeader
          ? res.getHeader('content-length')
          : undefined,
      },
    }),
    err: pino.stdSerializers.err,
  },
});

// Application logger with correlation ID support
export class AppLogger {
  private baseLogger: pino.Logger;

  constructor(baseLogger: pino.Logger = logger) {
    this.baseLogger = baseLogger;
  }

  // Create a child logger with correlation ID
  withCorrelationId(correlationId: string) {
    return new AppLogger(this.baseLogger.child({ correlationId }));
  }

  // Create a child logger with additional context
  withContext(context: Record<string, any>) {
    return new AppLogger(this.baseLogger.child(context));
  }

  // Log levels
  fatal(message: string, extra?: Record<string, any>) {
    this.baseLogger.fatal(extra, message);
  }

  error(message: string, extra?: Record<string, any>) {
    this.baseLogger.error(extra, message);
  }

  warn(message: string, extra?: Record<string, any>) {
    this.baseLogger.warn(extra, message);
  }

  info(message: string, extra?: Record<string, any>) {
    this.baseLogger.info(extra, message);
  }

  debug(message: string, extra?: Record<string, any>) {
    this.baseLogger.debug(extra, message);
  }

  trace(message: string, extra?: Record<string, any>) {
    this.baseLogger.trace(extra, message);
  }

  // Business logic logging helpers
  logDatabaseQuery(query: string, params?: any[], duration?: number) {
    this.debug('Database query executed', {
      query,
      params,
      duration,
      component: 'database',
    });
  }

  logValidationError(field: string, value: any, message: string) {
    this.warn('Validation error', {
      field,
      value,
      message,
      component: 'validation',
    });
  }

  logBusinessEvent(event: string, data?: Record<string, any>) {
    this.info(`Business event: ${event}`, {
      ...data,
      component: 'business-logic',
    });
  }

  logSecurityEvent(event: string, data?: Record<string, any>) {
    this.warn(`Security event: ${event}`, {
      ...data,
      component: 'security',
    });
  }

  logPerformanceMetric(metric: string, value: number, unit: string = 'ms') {
    this.info(`Performance metric: ${metric}`, {
      metric,
      value,
      unit,
      component: 'performance',
    });
  }
}

// Default app logger instance
export const appLogger = new AppLogger(logger);

// Helper to get correlation ID from request
export function getCorrelationId(req: any): string {
  return req.id || req.headers['x-correlation-id'] || randomUUID();
}

// Middleware to add correlation ID to request context
export function correlationMiddleware(req: any, res: any, next: any) {
  const correlationId = getCorrelationId(req);
  req.correlationId = correlationId;
  req.logger = appLogger.withCorrelationId(correlationId);

  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  next();
}

// Export the base logger for direct use if needed
export { logger };

// Performance timing helper
export class PerformanceTimer {
  private startTime: number;
  private logger: AppLogger;
  private operation: string;

  constructor(operation: string, logger: AppLogger = appLogger) {
    this.startTime = Date.now();
    this.operation = operation;
    this.logger = logger;
  }

  end(additionalData?: Record<string, any>) {
    const duration = Date.now() - this.startTime;
    this.logger.logPerformanceMetric(this.operation, duration, 'ms');

    if (additionalData) {
      this.logger.debug(`Operation completed: ${this.operation}`, {
        duration,
        ...additionalData,
      });
    }

    return duration;
  }
}
