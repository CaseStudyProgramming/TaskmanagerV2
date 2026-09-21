import { z } from 'zod';

export const taskFilterSchema = z.object({
  status: z.enum(['all', 'pending', 'in_progress', 'completed', 'cancelled']).default('all'),
  priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).default('all'),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([])
});

export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
