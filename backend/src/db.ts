import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { databaseConfig } from './config.js';
import { appLogger } from './logger.js';
import { DatabaseError } from './errors.js';

// Ensure database directory exists
const dbDir = path.dirname(databaseConfig.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  appLogger.info('Created database directory', { path: dbDir });
}

// Create database connection with optimized settings
export const db = new Database(databaseConfig.path, {
  verbose: (message, ...args) => {
    appLogger.debug('Database query', {
      query: message,
      params: args,
      component: 'database',
    });
  },
});

// Configure SQLite for better performance and reliability
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000');
db.pragma('temp_store = memory');
db.pragma('foreign_keys = ON');

// Initialize database schema
try {
  if (fs.existsSync(databaseConfig.schemaPath)) {
    const schema = fs.readFileSync(databaseConfig.schemaPath, 'utf8');
    db.exec(schema);
    appLogger.info('Database schema initialized', {
      schemaPath: databaseConfig.schemaPath,
      dbPath: databaseConfig.path,
    });
  } else {
    appLogger.warn('Schema file not found', {
      schemaPath: databaseConfig.schemaPath,
    });
  }
} catch (error) {
  const dbError = new DatabaseError(
    'schema_initialization',
    error instanceof Error ? error : new Error('Unknown schema error'),
    'schema initialization'
  );
  appLogger.error('Failed to initialize database schema', {
    error: dbError.toJSON(),
  });
  throw dbError;
}

// Database connection health check
export function checkDatabaseHealth(): boolean {
  try {
    const result = db.prepare('SELECT 1 as test').get() as { test: number };
    return result.test === 1;
  } catch (error) {
    appLogger.error('Database health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// Graceful shutdown
export function closeDatabaseConnection(): void {
  try {
    db.close();
    appLogger.info('Database connection closed gracefully');
  } catch (error) {
    appLogger.error('Error closing database connection', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Handle process termination
process.on('SIGINT', () => {
  closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabaseConnection();
  process.exit(0);
});

export default db;
