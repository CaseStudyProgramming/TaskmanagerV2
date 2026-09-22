import type { Task, TaskCreateInput } from './task';

export function createTask(input: TaskCreateInput, userId: string): Task {
  return {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    status: 'pending',
    priority: input.priority || 'medium',
    dueDate: input.dueDate,
    tags: input.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId
  };
}

export function updateTask(task: Task, updates: Partial<TaskUpdateInput>): Task {
  return {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}
