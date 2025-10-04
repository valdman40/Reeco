import { Request, Response, NextFunction } from 'express';
import { performance } from 'node:perf_hooks';
import { databaseConfig, monitoringConfig } from '../config.js';
import { appLogger } from '../logger.js';
import db from '../db.js';
import fs from 'node:fs';
import path from 'node:path';

// Metrics storage
interface Metrics {
  httpRequests: {
    total: number;
    byStatus: Record<string, number>;
    byMethod: Record<string, number>;
    byPath: Record<string, number>;
  };
  responseTimes: {
    count: number;
    sum: number;
    min: number;
    max: number;
    avg: number;
    p95: number[];
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
  database: {
    connections: number;
    queries: {
      total: number;
      byType: Record<string, number>;
      errors: number;
    };
  };
  system: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: number;
  };
}

class MetricsCollector {
  private metrics: Metrics;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      httpRequests: {
        total: 0,
        byStatus: {},
        byMethod: {},
        byPath: {},
      },
      responseTimes: {
        count: 0,
        sum: 0,
        min: Infinity,
        max: 0,
        avg: 0,
        p95: [],
      },
      errors: {
        total: 0,
        byType: {},
        byStatus: {},
      },
      database: {
        connections: 1, // SQLite has 1 connection
        queries: {
          total: 0,
          byType: {},
          errors: 0,
        },
      },
      system: {
        uptime: 0,
        memory: process.memoryUsage(),
        cpu: 0,
      },
    };
  }

  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number
  ) {
    this.metrics.httpRequests.total++;
    this.metrics.httpRequests.byMethod[method] =
      (this.metrics.httpRequests.byMethod[method] || 0) + 1;
    this.metrics.httpRequests.byPath[path] =
      (this.metrics.httpRequests.byPath[path] || 0) + 1;
    this.metrics.httpRequests.byStatus[statusCode] =
      (this.metrics.httpRequests.byStatus[statusCode] || 0) + 1;

    // Record response time
    this.recordResponseTime(responseTime);

    // Record errors
    if (statusCode >= 400) {
      this.metrics.errors.total++;
      this.metrics.errors.byStatus[statusCode] =
        (this.metrics.errors.byStatus[statusCode] || 0) + 1;
    }
  }

  recordResponseTime(responseTime: number) {
    const rt = this.metrics.responseTimes;
    rt.count++;
    rt.sum += responseTime;
    rt.min = Math.min(rt.min, responseTime);
    rt.max = Math.max(rt.max, responseTime);
    rt.avg = rt.sum / rt.count;

    // Keep only last 1000 response times for P95 calculation
    rt.p95.push(responseTime);
    if (rt.p95.length > 1000) {
      rt.p95.shift();
    }
  }

  recordError(errorType: string) {
    this.metrics.errors.total++;
    this.metrics.errors.byType[errorType] =
      (this.metrics.errors.byType[errorType] || 0) + 1;
  }

  recordDatabaseQuery(queryType: string, success: boolean) {
    this.metrics.database.queries.total++;
    this.metrics.database.queries.byType[queryType] =
      (this.metrics.database.queries.byType[queryType] || 0) + 1;

    if (!success) {
      this.metrics.database.queries.errors++;
    }
  }

  getMetrics(): Metrics & { timestamp: string } {
    // Update system metrics
    this.metrics.system.uptime = Date.now() - this.startTime;
    this.metrics.system.memory = process.memoryUsage();

    // Calculate P95 response time
    if (this.metrics.responseTimes.p95.length > 0) {
      const sorted = [...this.metrics.responseTimes.p95].sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      this.metrics.responseTimes.p95 = [sorted[p95Index] || 0]; // Store just the P95 value
    }

    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
    };
  }

  reset() {
    this.metrics = {
      httpRequests: { total: 0, byStatus: {}, byMethod: {}, byPath: {} },
      responseTimes: {
        count: 0,
        sum: 0,
        min: Infinity,
        max: 0,
        avg: 0,
        p95: [],
      },
      errors: { total: 0, byType: {}, byStatus: {} },
      database: {
        connections: 1,
        queries: { total: 0, byType: {}, errors: 0 },
      },
      system: { uptime: 0, memory: process.memoryUsage(), cpu: 0 },
    };
  }
}

const metricsCollector = new MetricsCollector();

// Request metrics middleware
export const requestMetrics = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = performance.now();

  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    metricsCollector.recordHttpRequest(
      req.method,
      req.route?.path || req.path,
      res.statusCode,
      responseTime
    );

    // Log slow requests
    if (responseTime > 1000) {
      // > 1 second
      (req as any).logger?.logPerformanceMetric(
        'slow_request',
        responseTime,
        'ms'
      );
    }
  });

  next();
};

// Database query metrics wrapper
export function withDatabaseMetrics<T>(operation: string, query: () => T): T {
  const startTime = performance.now();
  let success = true;

  try {
    const result = query();
    return result;
  } catch (error) {
    success = false;
    metricsCollector.recordError('database_error');
    throw error;
  } finally {
    const endTime = performance.now();
    const duration = endTime - startTime;

    metricsCollector.recordDatabaseQuery(operation, success);

    if (duration > 100) {
      // > 100ms
      appLogger.logPerformanceMetric(`database_${operation}`, duration, 'ms');
    }
  }
}

// Health check system
interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  duration?: number;
  timestamp: string;
}

class HealthChecker {
  async checkDatabase(): Promise<HealthCheck> {
    const startTime = performance.now();

    try {
      // Simple query to check database connectivity
      const result = db.prepare('SELECT 1 as test').get() as { test: number };
      const duration = performance.now() - startTime;

      if (result.test === 1) {
        return {
          name: 'database',
          status: duration > 1000 ? 'degraded' : 'healthy',
          message:
            duration > 1000
              ? 'Database responding slowly'
              : 'Database operational',
          duration,
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error('Unexpected database response');
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'database',
        status: 'unhealthy',
        message: `Database error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        duration,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkDiskSpace(): Promise<HealthCheck> {
    try {
      const dbDir = path.dirname(databaseConfig.path);
      const stats = fs.statSync(dbDir + '/.');

      // For SQLite, we mainly care about write permissions
      try {
        fs.accessSync(dbDir, fs.constants.W_OK);
        return {
          name: 'disk_space',
          status: 'healthy',
          message: 'Disk writable',
          timestamp: new Date().toISOString(),
        };
      } catch {
        return {
          name: 'disk_space',
          status: 'unhealthy',
          message: 'Disk not writable',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        name: 'disk_space',
        status: 'unhealthy',
        message: `Disk check failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkMemory(): Promise<HealthCheck> {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const memoryUsagePercent = (usedMem / totalMem) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = `Memory usage: ${memoryUsagePercent.toFixed(1)}%`;

    if (memoryUsagePercent > 90) {
      status = 'unhealthy';
      message += ' - Critical memory usage';
    } else if (memoryUsagePercent > 80) {
      status = 'degraded';
      message += ' - High memory usage';
    }

    return {
      name: 'memory',
      status,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  async performHealthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    checks: HealthCheck[];
    timestamp: string;
    uptime: number;
  }> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkDiskSpace(),
      this.checkMemory(),
    ]);

    // Determine overall status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (checks.some((check) => check.status === 'unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (checks.some((check) => check.status === 'degraded')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

const healthChecker = new HealthChecker();

// Health check endpoint handler
export const healthCheckHandler = async (req: Request, res: Response) => {
  try {
    const health = await healthChecker.performHealthCheck();

    const statusCode =
      health.status === 'healthy'
        ? 200
        : health.status === 'degraded'
        ? 200
        : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    appLogger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      correlationId: (req as any).correlationId,
    });

    res.status(503).json({
      status: 'unhealthy',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
};

// Metrics endpoint handler
export const metricsHandler = (req: Request, res: Response) => {
  if (!monitoringConfig.enableMetrics) {
    return res.status(404).json({ message: 'Metrics disabled' });
  }

  const metrics = metricsCollector.getMetrics();
  res.json(metrics);
};

// Error tracking
export const errorTracker = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorType = error.constructor.name;
  metricsCollector.recordError(errorType);

  (req as any).logger?.error('Request error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    },
    correlationId: (req as any).correlationId,
  });

  next(error);
};

export { metricsCollector, healthChecker };
