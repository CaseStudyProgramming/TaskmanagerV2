import type { TaskCreateInput } from '../model/task-create.schema';

export async function createTask(taskData: TaskCreateInput) {
  // TODO: Implement API call to create task
  const response = await fetch('/api/v1/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
}
