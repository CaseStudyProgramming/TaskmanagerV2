import type { Task } from '../model/task';

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  return new Date(task.dueDate) < new Date() && task.status !== 'completed';
}

export function isTaskDueSoon(task: Task, days: number = 3): boolean {
  if (!task.dueDate) return false;
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days && diffDays >= 0 && task.status !== 'completed';
}

export function getTaskStatusColor(status: Task['status']): string {
  const colors = {
    pending: '#64748b',
    in_progress: '#3b82f6',
    completed: '#22c55e',
    cancelled: '#ef4444'
  };
  return colors[status];
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return [...tasks].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function filterTasksByStatus(tasks: Task[], status: Task['status']): Task[] {
  return tasks.filter(task => task.status === status);
}

export function filterTasksByPriority(tasks: Task[], priority: Task['priority']): Task[] {
  return tasks.filter(task => task.priority === priority);
}

export function filterTasksByTag(tasks: Task[], tag: string): Task[] {
  return tasks.filter(task => task.tags.includes(tag));
}
