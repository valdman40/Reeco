import { z } from 'zod';

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
  status: z.enum(['pending','approved','rejected']).optional()
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const patchBodySchema = z.object({
  isApproved: z.boolean()
});

export type ListQuery = z.infer<typeof listQuerySchema>;
