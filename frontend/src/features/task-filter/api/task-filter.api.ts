import type { TaskFilterInput } from '../model/task-filter.schema';

export async function filterTasks(filters: TaskFilterInput) {
  // TODO: Implement API call to filter tasks
  const params = new URLSearchParams();
  
  if (filters.status !== 'all') params.append('status', filters.status);
  if (filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters.dueDate) params.append('dueDate', filters.dueDate);
  filters.tags.forEach(tag => params.append('tags', tag));

  const response = await fetch(`/api/v1/tasks?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to filter tasks');
  }

  return response.json();
}
