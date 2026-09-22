# Frontend Testing Examples

This document provides detailed code examples for frontend testing in TypeScript/Svelte.

## Time Helper Tests

### epochToDate
```typescript
describe('epochToDate', () => {
  it('should convert epoch to Date', () => {
    const epoch = 1726652400000;
    const date = epochToDate(epoch);
    expect(date.getTime()).toBe(epoch);
  });

  it('should handle zero epoch', () => {
    const date = epochToDate(0);
    expect(date.getTime()).toBe(0);
  });
});
```

### dateToEpoch
```typescript
describe('dateToEpoch', () => {
  it('should convert Date to epoch', () => {
    const date = new Date('2024-09-18T00:00:00.000Z');
    const epoch = dateToEpoch(date);
    expect(epoch).toBe(1726652400000);
  });
});
```

### nowEpoch
```typescript
describe('nowEpoch', () => {
  it('should return current epoch milliseconds', () => {
    const before = Date.now();
    const epoch = nowEpoch();
    const after = Date.now();
    
    expect(epoch).toBeGreaterThanOrEqual(before);
    expect(epoch).toBeLessThanOrEqual(after);
  });
});
```

### formatEpoch
```typescript
describe('formatEpoch', () => {
  it('should format epoch to readable string', () => {
    const epoch = 1726652400000;
    const formatted = formatEpoch(epoch, 'YYYY-MM-DD');
    expect(formatted).toBe('2024-09-18');
  });
});
```

## Response Helper Tests

### extractData
```typescript
describe('extractData', () => {
  it('should extract data from success response', () => {
    const response = {
      status: { code: 200, message: 'Success', is_success: true },
      data: { id: '1', title: 'Test' },
      meta: { timestamp: 1726652400000 }
    };
    
    const data = extractData(response);
    expect(data).toEqual({ id: '1', title: 'Test' });
  });
});
```

### extractError
```typescript
describe('extractError', () => {
  it('should extract errors from error response', () => {
    const response = {
      status: { code: 400, message: 'Validation failed', is_success: false },
      data: null,
      meta: {
        timestamp: 1726652400000,
        errors: [{ field: 'title', message: 'Title is required' }]
      }
    };
    
    const errors = extractError(response);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('title');
  });
});
```

### isSuccess
```typescript
describe('isSuccess', () => {
  it('should return true for success response', () => {
    const response = {
      status: { code: 200, message: 'Success', is_success: true },
      data: {},
      meta: {}
    };
    
    expect(isSuccess(response)).toBe(true);
  });

  it('should return false for error response', () => {
    const response = {
      status: { code: 400, message: 'Error', is_success: false },
      data: null,
      meta: {}
    };
    
    expect(isSuccess(response)).toBe(false);
  });
});
```

## API Response Format Tests

### Response Structure Validation
```typescript
describe('API response format validation', () => {
  it('should validate success response structure', () => {
    const response = {
      status: { code: 200, message: 'Success', is_success: true },
      data: { id: '1' },
      meta: { timestamp: 1726652400000, request_id: 'test-123' }
    };
    
    expect(response.status).toBeDefined();
    expect(response.data).toBeDefined();
    expect(response.meta).toBeDefined();
    expect(response.status.code).toBe(200);
    expect(response.status.is_success).toBe(true);
  });

  it('should validate error response structure', () => {
    const response = {
      status: { code: 400, message: 'Error', is_success: false },
      data: null,
      meta: { timestamp: 1726652400000, request_id: 'test-123', errors: [] }
    };
    
    expect(response.status).toBeDefined();
    expect(response.data).toBeNull();
    expect(response.meta).toBeDefined();
    expect(response.status.code).toBe(400);
    expect(response.status.is_success).toBe(false);
  });

  it('should validate meta timestamp format', () => {
    const response = {
      status: { code: 200, message: 'Success', is_success: true },
      data: {},
      meta: { timestamp: 1726652400000 }
    };
    
    expect(response.meta.timestamp).toBeGreaterThan(1000000000000);
    expect(response.meta.timestamp).toBeLessThan(9999999999999);
  });
});
```

## Component Tests

### TaskCard Component
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from './TaskCard.svelte';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'todo',
    priority: 'high'
  };

  it('should render task title', () => {
    render(TaskCard, { task: mockTask });
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should emit complete event when button clicked', async () => {
    const { component } = render(TaskCard, { task: mockTask });
    const button = screen.getByRole('button', { name: /complete/i });
    
    let emitted = false;
    component.$on('complete', () => { emitted = true });
    
    await fireEvent.click(button);
    expect(emitted).toBe(true);
  });

  it('should show urgent badge for high priority', () => {
    render(TaskCard, { task: { ...mockTask, priority: 'urgent' } });
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });
});
```

### TaskCreateForm Component
```typescript
describe('TaskCreateForm', () => {
  it('should validate required fields', async () => {
    const { component } = render(TaskCreateForm);
    const submitButton = screen.getByRole('button', { name: /create/i });
    
    await fireEvent.click(submitButton);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('should emit create event with valid data', async () => {
    const { component } = render(TaskCreateForm);
    
    let emittedData = null;
    component.$on('create', (event) => {
      emittedData = event.detail;
    });
    
    await fireEvent.input(screen.getByLabelText(/title/i), {
      target: { value: 'New Task' }
    });
    
    await fireEvent.click(screen.getByRole('button', { name: /create/i }));
    
    expect(emittedData).toEqual({ title: 'New Task' });
  });
});
```

## Store Tests

### TaskStore
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { taskStore } from './taskStore';

describe('taskStore', () => {
  beforeEach(() => {
    taskStore.reset();
  });

  it('should add task to store', () => {
    const task = { id: '1', title: 'Test', status: 'todo' };
    taskStore.addTask(task);
    
    expect(taskStore.tasks).toHaveLength(1);
    expect(taskStore.tasks[0]).toEqual(task);
  });

  it('should update task status', () => {
    taskStore.addTask({ id: '1', title: 'Test', status: 'todo' });
    taskStore.updateTaskStatus('1', 'completed');
    
    expect(taskStore.tasks[0].status).toBe('completed');
  });

  it('should delete task from store', () => {
    taskStore.addTask({ id: '1', title: 'Test', status: 'todo' });
    taskStore.deleteTask('1');
    
    expect(taskStore.tasks).toHaveLength(0);
  });
});
```

## Utility Function Tests

### Priority Calculator
```typescript
import { describe, it, expect } from 'vitest';
import { calculatePriorityScore } from './priority';

describe('calculatePriorityScore', () => {
  it('should return 100 for urgent tasks due today', () => {
    const task = {
      priority: 'urgent',
      dueDate: new Date()
    };
    expect(calculatePriorityScore(task)).toBe(100);
  });

  it('should return 0 for completed tasks', () => {
    const task = {
      priority: 'urgent',
      status: 'completed',
      dueDate: new Date()
    };
    expect(calculatePriorityScore(task)).toBe(0);
  });

  it('should increase score as due date approaches', () => {
    const farTask = {
      priority: 'medium',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
    const nearTask = {
      priority: 'medium',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    };
    
    expect(calculatePriorityScore(nearTask)).toBeGreaterThan(
      calculatePriorityScore(farTask)
    );
  });
});
```

## API Client Tests

### Task API Client
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskApi } from './client';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

describe('taskApi', () => {
  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should fetch tasks successfully', async () => {
    server.use(
      http.get('/api/v1/tasks', () => {
        return HttpResponse.json([
          { id: '1', title: 'Task 1' },
          { id: '2', title: 'Task 2' }
        ]);
      })
    );

    const tasks = await taskApi.getTasks();
    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task 1');
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('/api/v1/tasks', () => {
        return HttpResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      })
    );

    await expect(taskApi.getTasks()).rejects.toThrow('Unauthorized');
  });
});
```

## Feature Tests

### Task Create Feature
```typescript
describe('task-create feature', () => {
  it('should create task with valid data', async () => {
    const { createTask } = await import('./model/task-create.model');
    
    const result = await createTask({
      title: 'Test Task',
      priority: 'high',
      status: 'todo'
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should validate task title', async () => {
    const { createTask } = await import('./model/task-create.model');
    
    const result = await createTask({
      title: '',
      priority: 'high',
      status: 'todo'
    });
    
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Title is required');
  });
});
```

### Task Filter Feature
```typescript
describe('task-filter feature', () => {
  it('should filter tasks by status', () => {
    const { filterTasks } = require('./model/task-filter.model');
    
    const tasks = [
      { id: '1', status: 'todo' },
      { id: '2', status: 'completed' },
      { id: '3', status: 'todo' }
    ];
    
    const filtered = filterTasks(tasks, { status: 'todo' });
    expect(filtered).toHaveLength(2);
  });

  it('should filter tasks by priority', () => {
    const { filterTasks } = require('./model/task-filter.model');
    
    const tasks = [
      { id: '1', priority: 'high' },
      { id: '2', priority: 'low' },
      { id: '3', priority: 'high' }
    ];
    
    const filtered = filterTasks(tasks, { priority: 'high' });
    expect(filtered).toHaveLength(2);
  });
});
```

## Security Tests

### XSS Protection
```typescript
test('should sanitize HTML in task title', () => {
  const maliciousTitle = '<script>alert("xss")</script>';
  render(TaskCard, { task: { ...mockTask, title: maliciousTitle } });
  
  const titleElement = screen.getByTestId('task-title');
  expect(titleElement.innerHTML).not.toContain('<script>');
});
```

### Input Validation
```typescript
test('should validate task title length', () => {
  const longTitle = 'a'.repeat(201);
  
  const result = validateTaskTitle(longTitle);
  expect(result.valid).toBe(false);
  expect(result.error).toBe('Title must be less than 200 characters');
});
```

## E2E Tests

### Task Management Flow
```typescript
import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create a new task', async ({ page }) => {
    await page.click('[data-testid="add-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'New Task');
    await page.click('[data-testid="save-task-button"]');
    
    await expect(page.locator('[data-testid="task-item"]')).toContainText('New Task');
  });

  test('should complete a task', async ({ page }) => {
    await page.click('[data-testid="task-item-1"] [data-testid="complete-button"]');
    
    await expect(page.locator('[data-testid="task-item-1"]')).toHaveClass(/completed/);
  });

  test('should filter tasks by status', async ({ page }) => {
    await page.selectOption('[data-testid="status-filter"]', 'completed');
    
    const tasks = page.locator('[data-testid="task-item"]');
    await expect(tasks).toHaveCount(1);
  });
});
```

### Offline Mode Flow
```typescript
test('should work offline', async ({ page, context }) => {
  // Simulate offline mode
  await context.setOffline(true);
  
  await page.click('[data-testid="add-task-button"]');
  await page.fill('[data-testid="task-title-input"]', 'Offline Task');
  await page.click('[data-testid="save-task-button"]');
  
  await expect(page.locator('[data-testid="task-item"]')).toContainText('Offline Task');
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
});
```

### Auth Flow
```typescript
test('should login with Google OAuth', async ({ page }) => {
  await page.goto('/auth/login');
  await page.click('[data-testid="google-login-button"]');
  
  // Mock OAuth callback
  await page.goto('/auth/callback?code=test-code');
  
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
});
```
