import { z } from 'zod';
import path from 'node:path';

const configSchema = z.object({
  // Server Configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().default('localhost'),

  // Database Configuration
  DATABASE_PATH: z.string().default(path.join(process.cwd(), 'data', 'app.db')),
  DATABASE_SCHEMA_PATH: z
    .string()
    .default(path.join(process.cwd(), 'data', 'schema.sql')),

  // CORS Configuration
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(','))
    .default('http://localhost:5173,http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100), // requests per window

  // Pagination Limits
  DEFAULT_PAGE_SIZE: z.coerce.number().int().min(1).max(1000).default(20),
  MAX_PAGE_SIZE: z.coerce.number().int().min(1).max(1000).default(100),

  // Logging Configuration
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
  LOG_PRETTY: z.coerce.boolean().default(true), // Pretty print logs in development

  // Security
  TRUST_PROXY: z.coerce.boolean().default(false), // Set to true if behind reverse proxy

  // Monitoring
  ENABLE_METRICS: z.coerce.boolean().default(true),
  METRICS_PATH: z.string().default('/metrics'),

  // Health Check
  HEALTH_CHECK_PATH: z.string().default('/health'),
});

// Parse and validate environment variables
function loadConfig() {
  try {
    const config = configSchema.parse(process.env);

    // Additional validation for development vs production
    if (config.NODE_ENV === 'production') {
      // In production, require explicit configuration for sensitive settings
      if (process.env.FRONTEND_URL === undefined) {
        throw new Error('FRONTEND_URL must be explicitly set in production');
      }
      if (process.env.DATABASE_PATH === undefined) {
        throw new Error('DATABASE_PATH must be explicitly set in production');
      }
    }

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  • ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const config = loadConfig();

// Export individual config sections for easier imports
export const serverConfig = {
  nodeEnv: config.NODE_ENV,
  port: config.PORT,
  host: config.HOST,
  trustProxy: config.TRUST_PROXY,
};

export const databaseConfig = {
  path: config.DATABASE_PATH,
  schemaPath: config.DATABASE_SCHEMA_PATH,
};

export const corsConfig = {
  frontendUrl: config.FRONTEND_URL,
  allowedOrigins: config.ALLOWED_ORIGINS,
};

export const rateLimitConfig = {
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
};

export const paginationConfig = {
  defaultPageSize: config.DEFAULT_PAGE_SIZE,
  maxPageSize: config.MAX_PAGE_SIZE,
};

export const loggingConfig = {
  level: config.LOG_LEVEL,
  pretty: config.LOG_PRETTY,
};

export const monitoringConfig = {
  enableMetrics: config.ENABLE_METRICS,
  metricsPath: config.METRICS_PATH,
  healthCheckPath: config.HEALTH_CHECK_PATH,
};

// Utility function to check if we're in development
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isTest = () => config.NODE_ENV === 'test';
