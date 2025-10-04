import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { rateLimitConfig, corsConfig, isProduction } from '../config.js';
import { RateLimitError } from '../errors.js';
import { appLogger } from '../logger.js';

// Rate limiting middleware
export const createRateLimiter = () => {
  return rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.maxRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      error: 'Too many requests',
      message: `Rate limit exceeded. Maximum ${
        rateLimitConfig.maxRequests
      } requests per ${rateLimitConfig.windowMs / 1000 / 60} minutes.`,
    },
    handler: (req, res) => {
      const correlationId = req.correlationId || 'unknown';
      const clientIp = req.ip || req.connection.remoteAddress;

      // Log security event
      appLogger.logSecurityEvent('Rate limit exceeded', {
        correlationId,
        clientIp,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      const resetTime = new Date(Date.now() + rateLimitConfig.windowMs);
      const error = new RateLimitError(
        rateLimitConfig.maxRequests,
        resetTime,
        correlationId
      );

      res.status(error.getHttpStatus()).json({
        error: error.toJSON(),
        retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000),
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks in production
      return req.path === '/health' || req.path === '/metrics';
    },
  });
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' },
});

// CORS configuration
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (corsConfig.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, be more permissive
    if (!isProduction() && origin.startsWith('http://localhost:')) {
      appLogger.logSecurityEvent(
        'CORS: Allowing localhost origin in development',
        {
          origin,
          environment: 'development',
        }
      );
      return callback(null, true);
    }

    // Log and reject unauthorized origins
    appLogger.logSecurityEvent('CORS: Rejected unauthorized origin', {
      origin,
      allowedOrigins: corsConfig.allowedOrigins,
    });

    const error = new Error(`Origin ${origin} not allowed by CORS policy`);
    callback(error, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Correlation-ID',
  ],
  exposedHeaders: ['X-Correlation-ID'],
  maxAge: 86400, // 24 hours
});

// Compression middleware
export const compressionMiddleware = compression({
  level: 6, // Good balance between compression ratio and CPU usage
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if the client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Use compression filter from compression module
    return compression.filter(req, res);
  },
});

// Request size limiting middleware
export const requestSizeLimiter = (req: any, res: any, next: any) => {
  const maxSize = 1024 * 1024; // 1MB limit
  const contentLength = parseInt(req.get('content-length') || '0', 10);

  if (contentLength > maxSize) {
    appLogger.logSecurityEvent('Request size limit exceeded', {
      correlationId: req.correlationId,
      contentLength,
      maxSize,
      clientIp: req.ip,
      path: req.path,
    });

    return res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: `Request entity too large. Maximum size is ${maxSize} bytes.`,
        correlationId: req.correlationId,
      },
    });
  }

  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: any, res: any, next: any) => {
  // Sanitize query parameters
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        // Remove potential XSS patterns
        req.query[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    }
  }

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};

function sanitizeObject(obj: any): void {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      obj[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (typeof value === 'object' && value !== null) {
      sanitizeObject(value);
    }
  }
}

// Security event logging middleware
export const securityEventLogger = (req: any, res: any, next: any) => {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union\s+select/gi, // SQL injection
    /javascript:/gi, // XSS
    /eval\(/gi, // Code injection
  ];

  const url = req.url;
  const userAgent = req.get('User-Agent') || '';
  const body = JSON.stringify(req.body || {});

  const isSuspicious = suspiciousPatterns.some(
    (pattern) =>
      pattern.test(url) || pattern.test(userAgent) || pattern.test(body)
  );

  if (isSuspicious) {
    appLogger.logSecurityEvent('Suspicious request detected', {
      correlationId: req.correlationId,
      clientIp: req.ip,
      userAgent,
      url,
      method: req.method,
      body: req.body,
      headers: {
        'content-type': req.get('content-type'),
        origin: req.get('origin'),
        referer: req.get('referer'),
      },
    });
  }

  next();
};
