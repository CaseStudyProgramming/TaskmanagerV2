export interface PriorityFactors {
  dueDate: string;
  importance: number;
  urgency: number;
  complexity: number;
}

export interface PriorityResult {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  score: number;
  factors: PriorityFactors;
}

export function calculatePriority(factors: PriorityFactors): PriorityResult {
  const today = new Date();
  const dueDate = new Date(factors.dueDate);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate priority score (0-100)
  let score = 0;

  // Due date factor (0-40 points)
  if (daysUntilDue <= 0) score += 40;
  else if (daysUntilDue <= 1) score += 35;
  else if (daysUntilDue <= 3) score += 30;
  else if (daysUntilDue <= 7) score += 20;
  else if (daysUntilDue <= 14) score += 10;

  // Importance factor (0-30 points)
  score += factors.importance * 30;

  // Urgency factor (0-20 points)
  score += factors.urgency * 20;

  // Complexity factor (0-10 points, inverse - higher complexity = lower priority)
  score += (1 - factors.complexity) * 10;

  // Determine priority level
  let priority: 'low' | 'medium' | 'high' | 'urgent';
  if (score >= 80) priority = 'urgent';
  else if (score >= 60) priority = 'high';
  else if (score >= 40) priority = 'medium';
  else priority = 'low';

  return {
    priority,
    score: Math.round(score),
    factors
  };
}
