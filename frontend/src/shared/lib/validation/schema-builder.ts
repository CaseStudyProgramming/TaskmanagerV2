import { z } from 'zod';

export function createPaginationSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      pageSize: z.number(),
      totalPages: z.number(),
    }),
  });
}

export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    errors: z.array(z.string()).optional(),
  });
}

export function createIdSchema() {
  return z.string().uuid('Invalid ID format');
}

export function createDateSchema() {
  return z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid date format' }
  );
}

export function createEmailSchema() {
  return z.string().email('Invalid email format');
}

export function createUrlSchema() {
  return z.string().url('Invalid URL format');
}
