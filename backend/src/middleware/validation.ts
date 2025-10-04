import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError, ErrorFactory } from '../errors.js';
import { paginationConfig } from '../config.js';

// Enhanced validation schemas with better error messages
export const listQuerySchema = z
  .object({
    page: z.coerce
      .number({
        invalid_type_error: 'Page must be a number',
        required_error: 'Page is required',
      })
      .int('Page must be an integer')
      .min(1, 'Page must be at least 1')
      .default(1),
    limit: z.coerce
      .number({
        invalid_type_error: 'Limit must be a number',
        required_error: 'Limit is required',
      })
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .max(
        paginationConfig.maxPageSize,
        `Limit cannot exceed ${paginationConfig.maxPageSize}`
      )
      .default(paginationConfig.defaultPageSize),
    q: z
      .string()
      .trim()
      .min(1, 'Search query cannot be empty')
      .max(255, 'Search query cannot exceed 255 characters')
      .optional(),
    status: z
      .enum(['pending', 'approved', 'rejected', 'cancelled'], {
        errorMap: () => ({
          message:
            'Status must be one of: pending, approved, rejected, cancelled',
        }),
      })
      .optional(),
    sort: z
      .string()
      .regex(
        /^(createdAt|total|customer|status):(asc|desc)$/,
        'Sort must be in format "field:direction" where field is createdAt|total|customer|status and direction is asc|desc'
      )
      .default('createdAt:desc'),
  })
  .transform((data) => {
    // Parse sort parameter (e.g., "total:asc" -> sortBy: "total_cents", sortOrder: "asc")
    const [sortField, sortDirection] = data.sort.split(':');

    // Map frontend field names to database column names
    const fieldMapping: Record<string, string> = {
      createdAt: 'created_at',
      total: 'total_cents',
      customer: 'customer',
      status: 'status',
    };

    const sortBy = fieldMapping[sortField] || 'created_at';
    const sortOrder = ['asc', 'desc'].includes(sortDirection)
      ? sortDirection
      : 'desc';

    return {
      ...data,
      sortBy,
      sortOrder,
    };
  });

export const idParamSchema = z.object({
  id: z.string().uuid('Order ID must be a valid UUID').describe('Order ID'),
});

export const patchBodySchema = z
  .object({
    isApproved: z
      .boolean({
        invalid_type_error: 'isApproved must be a boolean value',
      })
      .optional(),
    isCancelled: z
      .boolean({
        invalid_type_error: 'isCancelled must be a boolean value',
      })
      .optional(),
  })
  .refine(
    (data) => {
      const hasApproved = data.isApproved !== undefined;
      const hasCancelled = data.isCancelled !== undefined;
      return hasApproved !== hasCancelled; // XOR: exactly one must be present
    },
    {
      message:
        "Either 'isApproved' or 'isCancelled' must be provided, but not both",
      path: ['root'],
    }
  )
  .refine(
    (data) => {
      // If isCancelled is provided, it must be true
      if (data.isCancelled !== undefined && data.isCancelled !== true) {
        return false;
      }
      return true;
    },
    {
      message: 'isCancelled must be true when provided',
      path: ['isCancelled'],
    }
  );

// Type exports
export type ListQuery = z.infer<typeof listQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type PatchBody = z.infer<typeof patchBodySchema>;

// Validation middleware factory
export function validateSchema<T>(
  schema: ZodSchema<T>,
  target: 'body' | 'params' | 'query' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const correlationId = (req as any).correlationId;
      const logger = (req as any).logger;
      const errorFactory = new ErrorFactory(correlationId);

      let dataToValidate: any;
      switch (target) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        default:
          dataToValidate = req.body;
      }

      const result = schema.parse(dataToValidate);

      // Attach validated data to request
      switch (target) {
        case 'body':
          req.body = result;
          break;
        case 'params':
          req.params = result as any;
          break;
        case 'query':
          (req as any).validatedQuery = result;
          break;
      }

      logger?.debug(`Validation successful for ${target}`, {
        target,
        data: result,
        component: 'validation',
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const correlationId = (req as any).correlationId;
        const logger = (req as any).logger;
        const errorFactory = new ErrorFactory(correlationId);

        // Transform Zod errors into our ValidationError format
        const validationDetails = error.errors.map((err) => ({
          field: err.path.join('.') || 'unknown',
          message: err.message,
          code: err.code,
          value: err.path.reduce(
            (obj, key) => obj?.[key],
            target === 'body'
              ? req.body
              : target === 'params'
              ? req.params
              : req.query
          ),
        }));

        logger?.logValidationError(
          validationDetails[0]?.field || 'unknown',
          validationDetails[0]?.value,
          validationDetails[0]?.message || 'Validation failed'
        );

        const validationError = errorFactory.createValidationError(
          `Validation failed for ${target}`,
          validationDetails
        );

        return res.status(validationError.getHttpStatus()).json({
          error: validationError.toJSON(),
        });
      }

      next(error);
    }
  };
}

// Specific validation middleware
export const validateListQuery = validateSchema(listQuerySchema, 'query');
export const validateIdParam = validateSchema(idParamSchema, 'params');
export const validatePatchBody = validateSchema(patchBodySchema, 'body');

// Validation utility functions
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^\w\s-]/g, '') // Allow only word characters, spaces, and hyphens
    .substring(0, 255); // Limit length
}

export function validateSortParameter(sort: string): {
  sortBy: string;
  sortOrder: string;
} {
  const validSortFields = ['created_at', 'total_cents', 'customer', 'status'];
  const validSortOrders = ['asc', 'desc'];

  const [field, order] = sort.split(':');

  const sortBy = validSortFields.includes(field) ? field : 'created_at';
  const sortOrder = validSortOrders.includes(order?.toLowerCase())
    ? order.toLowerCase()
    : 'desc';

  return { sortBy, sortOrder };
}

// Business validation functions (moved from repo layer)
export function validateOrderStatus(
  currentStatus: string,
  action: 'approve' | 'reject' | 'cancel'
): { isValid: boolean; reason?: string } {
  const validTransitions: Record<string, string[]> = {
    pending: ['approve', 'reject', 'cancel'],
    approved: ['cancel'], // Can only cancel approved orders
    rejected: [], // Cannot change rejected orders
    cancelled: [], // Cannot change cancelled orders
  };

  const allowedActions = validTransitions[currentStatus] || [];

  if (!allowedActions.includes(action)) {
    return {
      isValid: false,
      reason: `Cannot ${action} order with status ${currentStatus}. Allowed actions: ${
        allowedActions.join(', ') || 'none'
      }`,
    };
  }

  return { isValid: true };
}

export function validatePaginationParams(
  page: number,
  limit: number
): {
  isValid: boolean;
  errors: string[];
  normalizedPage: number;
  normalizedLimit: number;
} {
  const errors: string[] = [];
  let normalizedPage = Math.max(1, Math.floor(page));
  let normalizedLimit = Math.min(
    paginationConfig.maxPageSize,
    Math.max(1, Math.floor(limit))
  );

  if (page < 1) {
    errors.push('Page must be at least 1');
  }
  if (limit < 1) {
    errors.push('Limit must be at least 1');
  }
  if (limit > paginationConfig.maxPageSize) {
    errors.push(`Limit cannot exceed ${paginationConfig.maxPageSize}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedPage,
    normalizedLimit,
  };
}
