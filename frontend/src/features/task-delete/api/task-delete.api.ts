export async function deleteTask(taskId: string) {
  // TODO: Implement API call to delete task
  const response = await fetch(`/api/v1/tasks/${taskId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }

  return response.json();
}
