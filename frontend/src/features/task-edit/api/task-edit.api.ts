import type { TaskEditInput } from '../model/task-edit.schema';

export async function updateTask(taskId: string, taskData: Partial<TaskEditInput>) {
  // TODO: Implement API call to update task
  const response = await fetch(`/api/v1/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  return response.json();
}
