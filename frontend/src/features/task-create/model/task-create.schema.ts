import { z } from 'zod';

export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([])
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
