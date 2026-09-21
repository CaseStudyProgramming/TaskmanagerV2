import { calculatePriority, type PriorityFactors } from '../model/priority-calculator';

export async function prioritizeTask(taskId: string, factors: PriorityFactors) {
  // Calculate priority locally
  const result = calculatePriority(factors);

  // TODO: Implement API call to update task priority
  const response = await fetch(`/api/v1/tasks/${taskId}/priority`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priority: result.priority,
      score: result.score
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update task priority');
  }

  return response.json();
}
