import { randomUUID } from 'node:crypto';

// Base error class with correlation tracking
export abstract class BaseError extends Error {
  public readonly correlationId: string;
  public readonly timestamp: string;
  public readonly code: string;

  constructor(message: string, correlationId?: string) {
    super(message);
    this.name = this.constructor.name;
    this.correlationId = correlationId || randomUUID();
    this.timestamp = new Date().toISOString();
    this.code = this.getErrorCode();

    // Maintain proper stack trace
    Error.captureStackTrace?.(this, this.constructor);
  }

  abstract getErrorCode(): string;
  abstract getHttpStatus(): number;

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
    };
  }
}

// HTTP Error for web responses
export class HttpError extends BaseError {
  public readonly status: number;
  public readonly details?: Record<string, any>;

  constructor(
    status: number,
    message: string,
    details?: Record<string, any>,
    correlationId?: string
  ) {
    super(message, correlationId);
    this.status = status;
    this.details = details;
  }

  getErrorCode(): string {
    return `HTTP_${this.status}`;
  }

  getHttpStatus(): number {
    return this.status;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      status: this.status,
      details: this.details,
    };
  }
}

// Validation Error
export class ValidationError extends BaseError {
  public readonly field?: string;
  public readonly value?: any;
  public readonly validationDetails: Array<{
    field: string;
    message: string;
    code?: string;
    value?: any;
  }>;

  constructor(
    message: string,
    validationDetails: Array<{
      field: string;
      message: string;
      code?: string;
      value?: any;
    }>,
    correlationId?: string
  ) {
    super(message, correlationId);
    this.validationDetails = validationDetails;
  }

  getErrorCode(): string {
    return 'VALIDATION_ERROR';
  }

  getHttpStatus(): number {
    return 400;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      validationDetails: this.validationDetails,
    };
  }
}

// Business Logic Error
export class BusinessError extends BaseError {
  public readonly businessCode: string;
  public readonly context?: Record<string, any>;

  constructor(
    businessCode: string,
    message: string,
    context?: Record<string, any>,
    correlationId?: string
  ) {
    super(message, correlationId);
    this.businessCode = businessCode;
    this.context = context;
    // Fix the code property after businessCode is set
    (this as any).code = this.getErrorCode();
  }

  getErrorCode(): string {
    return this.businessCode;
  }

  getHttpStatus(): number {
    // Map business error codes to HTTP status codes
    switch (this.businessCode) {
      case 'ORDER_NOT_FOUND':
        return 404;
      case 'ORDER_ALREADY_PROCESSED':
      case 'INVALID_ORDER_STATUS':
        return 409;
      case 'UNAUTHORIZED_ACTION':
        return 403;
      case 'INSUFFICIENT_PERMISSIONS':
        return 403;
      default:
        return 400;
    }
  }

  toJSON() {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      businessCode: this.businessCode,
      context: this.context,
    };
  }
}

// Database Error
export class DatabaseError extends BaseError {
  public readonly operation: string;
  public readonly query?: string;
  public readonly originalError: Error;

  constructor(
    operation: string,
    originalError: Error,
    query?: string,
    correlationId?: string
  ) {
    super(`Database operation failed: ${operation}`, correlationId);
    this.operation = operation;
    this.query = query;
    this.originalError = originalError;
  }

  getErrorCode(): string {
    return 'DATABASE_ERROR';
  }

  getHttpStatus(): number {
    return 500;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      originalError: {
        name: this.originalError.name,
        message: this.originalError.message,
      },
    };
  }
}

// Configuration Error
export class ConfigurationError extends BaseError {
  public readonly configKey: string;

  constructor(configKey: string, message: string, correlationId?: string) {
    super(message, correlationId);
    this.configKey = configKey;
  }

  getErrorCode(): string {
    return 'CONFIGURATION_ERROR';
  }

  getHttpStatus(): number {
    return 500;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      configKey: this.configKey,
    };
  }
}

// Rate Limit Error
export class RateLimitError extends BaseError {
  public readonly limit: number;
  public readonly resetTime: Date;

  constructor(limit: number, resetTime: Date, correlationId?: string) {
    super(`Rate limit exceeded. Limit: ${limit} requests`, correlationId);
    this.limit = limit;
    this.resetTime = resetTime;
  }

  getErrorCode(): string {
    return 'RATE_LIMIT_EXCEEDED';
  }

  getHttpStatus(): number {
    return 429;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      limit: this.limit,
      resetTime: this.resetTime.toISOString(),
    };
  }
}

// Specific business errors
export class OrderNotFoundError extends BusinessError {
  constructor(orderId: string, correlationId?: string) {
    super(
      'ORDER_NOT_FOUND',
      `Order with ID ${orderId} not found`,
      { orderId },
      correlationId
    );
  }
}

export class OrderAlreadyProcessedError extends BusinessError {
  constructor(orderId: string, currentStatus: string, correlationId?: string) {
    super(
      'ORDER_ALREADY_PROCESSED',
      `Order ${orderId} is already ${currentStatus} and cannot be modified`,
      { orderId, currentStatus },
      correlationId
    );
  }
}

export class InvalidOrderStatusError extends BusinessError {
  constructor(
    orderId: string,
    currentStatus: string,
    attemptedAction: string,
    correlationId?: string
  ) {
    super(
      'INVALID_ORDER_STATUS',
      `Cannot ${attemptedAction} order ${orderId} with status ${currentStatus}`,
      { orderId, currentStatus, attemptedAction },
      correlationId
    );
  }
}

// Error factory for creating errors with correlation IDs
export class ErrorFactory {
  constructor(private correlationId?: string) {}

  createHttpError(
    status: number,
    message: string,
    details?: Record<string, any>
  ) {
    return new HttpError(status, message, details, this.correlationId);
  }

  createValidationError(
    message: string,
    validationDetails: Array<{
      field: string;
      message: string;
      code?: string;
      value?: any;
    }>
  ) {
    return new ValidationError(message, validationDetails, this.correlationId);
  }

  createBusinessError(
    businessCode: string,
    message: string,
    context?: Record<string, any>
  ) {
    return new BusinessError(
      businessCode,
      message,
      context,
      this.correlationId
    );
  }

  createDatabaseError(operation: string, originalError: Error, query?: string) {
    return new DatabaseError(
      operation,
      originalError,
      query,
      this.correlationId
    );
  }

  createOrderNotFoundError(orderId: string) {
    return new OrderNotFoundError(orderId, this.correlationId);
  }

  createOrderAlreadyProcessedError(orderId: string, currentStatus: string) {
    return new OrderAlreadyProcessedError(
      orderId,
      currentStatus,
      this.correlationId
    );
  }

  createInvalidOrderStatusError(
    orderId: string,
    currentStatus: string,
    attemptedAction: string
  ) {
    return new InvalidOrderStatusError(
      orderId,
      currentStatus,
      attemptedAction,
      this.correlationId
    );
  }
}
