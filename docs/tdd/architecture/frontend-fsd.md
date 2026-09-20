# Frontend Architecture - Feature-Sliced Design

This document explains the frontend architecture using Feature-Sliced Design (FSD) and Vertical Slices patterns.

## Overview

The frontend follows FSD principles with clear separation across app, pages, features, entities, shared, and widgets layers.

## Architecture Layers

### 1. App Layer

Global application configuration and providers.

#### Structure
```
src/app/
├── providers/
│   ├── auth-provider.svelte       # Authentication provider
│   ├── theme-provider.svelte     # Theme provider
│   └── query-client-provider.svelte # React Query client
├── routes/
│   └── routes.ts                 # Route configuration
└── styles/
    └── global.css                 # Global styles
```

#### Auth Provider Example
```typescript
// src/app/providers/auth-provider.svelte
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  return {
    subscribe,
    login: (user: User, token: string) => {
      if (browser) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      set({ isAuthenticated: true, user, token });
    },
    logout: () => {
      if (browser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      set({ isAuthenticated: false, user: null, token: null });
    },
    init: () => {
      if (browser) {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          set({ isAuthenticated: true, user, token });
        }
      }
    },
  };
}

export const auth = createAuthStore();
```

### 2. Pages Layer

Page-level components and routing.

#### Structure
```
src/pages/
├── home/
│   ├── ui/
│   │   └── HomePage.svelte
│   └── index.ts
├── auth/
│   ├── login/
│   │   ├── ui/
│   │   │   └── LoginPage.svelte
│   │   └── index.ts
│   └── callback/
│       ├── ui/
│       │   └── CallbackPage.svelte
│       └── index.ts
└── tasks/
    ├── list/
    │   ├── ui/
    │   │   └── TaskListPage.svelte
    │   └── index.ts
    └── detail/
        ├── ui/
        │   └── TaskDetailPage.svelte
        └── index.ts
```

#### Page Example
```svelte
<!-- src/pages/tasks/list/ui/TaskListPage.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { taskStore } from '$features/task-list/model';
  import TaskList from '$widgets/task-list/TaskList.svelte';
  import TaskFilter from '$features/task-filter/ui/TaskFilter.svelte';
  import CreateTaskButton from '$features/task-create/ui/CreateTaskButton.svelte';

  onMount(() => {
    taskStore.loadTasks();
  });
</script>

<div class="task-list-page">
  <header>
    <h1>My Tasks</h1>
    <CreateTaskButton />
  </header>

  <TaskFilter />

  <TaskList tasks={$taskStore.tasks} />
</div>
```

### 3. Features Layer

Feature-specific business logic, API integration, and UI components.

#### Structure
```
src/features/
├── task-create/
│   ├── model/
│   │   ├── task-create.model.ts      # Business logic
│   │   └── task-create.model.spec.ts
│   ├── api/
│   │   ├── task-create.api.ts        # API calls
│   │   └── task-create.api.spec.ts
│   └── ui/
│       ├── TaskCreateForm.svelte
│       └── TaskCreateForm.spec.ts
├── task-edit/
│   ├── model/
│   │   ├── task-edit.model.ts
│   │   └── task-edit.model.spec.ts
│   ├── api/
│   │   ├── task-edit.api.ts
│   │   └── task-edit.api.spec.ts
│   └── ui/
│       ├── TaskEditForm.svelte
│       └── TaskEditForm.spec.ts
├── task-delete/
│   ├── model/
│   │   ├── task-delete.model.ts
│   │   └── task-delete.model.spec.ts
│   ├── api/
│   │   ├── task-delete.api.ts
│   │   └── task-delete.api.spec.ts
│   └── ui/
│       ├── TaskDeleteButton.svelte
│       └── TaskDeleteButton.spec.ts
├── task-filter/
│   ├── model/
│   │   ├── task-filter.model.ts
│   │   └── task-filter.model.spec.ts
│   ├── api/
│   │   ├── task-filter.api.ts
│   │   └── task-filter.api.spec.ts
│   └── ui/
│       ├── TaskFilterPanel.svelte
│       └── TaskFilterPanel.spec.ts
├── task-prioritize/
│   ├── model/
│   │   ├── priority-calculator.ts
│   │   └── priority-calculator.spec.ts
│   ├── api/
│   │   ├── task-prioritize.api.ts
│   │   └── task-prioritize.api.spec.ts
│   └── ui/
│       ├── PriorityBadge.svelte
│       └── PriorityBadge.spec.ts
├── auth-google/
│   ├── model/
│   │   ├── google-auth.model.ts
│   │   └── google-auth.model.spec.ts
│   ├── api/
│   │   ├── google-auth.api.ts
│   │   └── google-auth.api.spec.ts
│   └── ui/
│       ├── GoogleLoginButton.svelte
│       └── GoogleLoginButton.spec.ts
├── export-import/
│   ├── model/
│   │   ├── export-import.model.ts
│   │   └── export-import.model.spec.ts
│   ├── api/
│   │   ├── export-import.api.ts
│   │   └── export-import.api.spec.ts
│   └── ui/
│       ├── ExportButton.svelte
│       ├── ExportButton.spec.ts
│       ├── ImportButton.svelte
│       └── ImportButton.spec.ts
└── offline-sync/
    ├── model/
    │   ├── sync-queue.model.ts
    │   └── sync-queue.model.spec.ts
    ├── api/
    │   ├── offline-sync.api.ts
    │   └── offline-sync.api.spec.ts
    └── ui/
        ├── OfflineIndicator.svelte
        └── OfflineIndicator.spec.ts
```

#### Feature Model Example
```typescript
// src/features/task-create/model/task-create.model.ts
import { writable } from 'svelte/store';
import { taskApi } from './api/task-create.api';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskState {
  formData: TaskFormData;
  isSubmitting: boolean;
  error: string | null;
}

function createTaskStore() {
  const { subscribe, set, update } = writable<CreateTaskState>({
    formData: {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: undefined,
      tags: [],
    },
    isSubmitting: false,
    error: null,
  });

  return {
    subscribe,
    updateFormData: (field: keyof TaskFormData, value: any) => {
      update((state) => ({
        ...state,
        formData: { ...state.formData, [field]: value },
        error: null,
      }));
    },
    submit: async () => {
      update((state) => ({ ...state, isSubmitting: true, error: null }));

      try {
        // Validate form data
        const validatedData = taskSchema.parse(this.formData);

        // Call API
        const result = await taskApi.createTask(validatedData);

        if (result.success) {
          // Reset form
          set({
            formData: {
              title: '',
              description: '',
              priority: 'medium',
              dueDate: undefined,
              tags: [],
            },
            isSubmitting: false,
            error: null,
          });
          return { success: true };
        } else {
          update((state) => ({
            ...state,
            isSubmitting: false,
            error: result.message,
          }));
          return { success: false, error: result.message };
        }
      } catch (error) {
        update((state) => ({
          ...state,
          isSubmitting: false,
          error: error instanceof Error ? error.message : 'Validation failed',
        }));
        return { success: false, error: 'Validation failed' };
      }
    },
  };
}

export const taskCreateStore = createTaskStore();
```

#### Feature API Example
```typescript
// src/features/task-create/api/task-create.api.ts
import { extractData, isSuccess } from '$shared/lib/response-helpers';

interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: string;
  dueDate?: number;
  tags?: string[];
}

interface StandardResponse<T> {
  status: {
    code: number;
    message: string;
    is_success: boolean;
  };
  data: T;
  meta: {
    timestamp: number;
    request_id: string;
  };
}

export const taskApi = {
  async createTask(data: CreateTaskRequest) {
    const response = await fetch('/api/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    const result: StandardResponse<any> = await response.json();

    if (isSuccess(result)) {
      return { success: true, data: extractData(result) };
    } else {
      return { success: false, message: result.status.message };
    }
  },
};
```

#### Feature UI Example
```svelte
<!-- src/features/task-create/ui/TaskCreateForm.svelte -->
<script lang="ts">
  import { taskCreateStore } from '../model/task-create.model';
  import Button from '$shared/ui/Button.svelte';
  import Input from '$shared/ui/Input.svelte';
  import Select from '$shared/ui/Select.svelte';

  let formData = $taskCreateStore.formData;
  let isSubmitting = $taskCreateStore.isSubmitting;
  let error = $taskCreateStore.error;

  function handleSubmit() {
    taskCreateStore.submit();
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <Input
    label="Title"
    value={formData.title}
    on:input={(e) => taskCreateStore.updateFormData('title', e.detail)}
    required
  />

  <Select
    label="Priority"
    value={formData.priority}
    options={[
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ]}
    on:change={(e) => taskCreateStore.updateFormData('priority', e.detail)}
  />

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Creating...' : 'Create Task'}
  </Button>
</form>
```

### 4. Entities Layer

Domain entities and their business logic.

#### Structure
```
src/entities/
├── task/
│   ├── model/
│   │   ├── task.ts               # Task entity
│   │   └── task.spec.ts
│   └── lib/
│       ├── task-utils.ts         # Task utilities
│       └── task-utils.spec.ts
├── user/
│   ├── model/
│   │   ├── user.ts               # User entity
│   │   └── user.spec.ts
│   └── lib/
│       ├── user-utils.ts
│       └── user-utils.spec.ts
└── auth/
    ├── model/
    │   ├── session.ts            # Session entity
    │   └── session.spec.ts
    └── lib/
        ├── auth-utils.ts
        └── auth-utils.spec.ts
```

#### Entity Example
```typescript
// src/entities/task/model/task.ts
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: number; // Epoch milliseconds
  tags: string[];
  createdAt: number; // Epoch milliseconds
  updatedAt: number; // Epoch milliseconds
  completedAt?: number; // Epoch milliseconds
  priorityScore: number;
}

export function createTask(data: Partial<Task>): Task {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    userId: data.userId || '',
    title: data.title || '',
    description: data.description,
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    dueDate: data.dueDate,
    tags: data.tags || [],
    createdAt: now,
    updatedAt: now,
    completedAt: data.completedAt,
    priorityScore: data.priorityScore || 0,
  };
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'completed') {
    return false;
  }
  return Date.now() > task.dueDate;
}

export function getTaskPriorityWeight(priority: Task['priority']): number {
  switch (priority) {
    case 'urgent':
      return 100;
    case 'high':
      return 75;
    case 'medium':
      return 50;
    case 'low':
      return 25;
    default:
      return 0;
  }
}
```

### 5. Shared Layer

Shared utilities, API clients, and UI components.

#### Structure
```
src/shared/
├── api/
│   ├── client.ts                 # Shared API client
│   └── client.spec.ts
├── config/
│   ├── config.ts                 # Configuration
│   └── config.spec.ts
├── lib/
│   ├── validation.ts             # Validation utilities
│   ├── validation.spec.ts
│   ├── time-helpers.ts           # Time helper functions
│   ├── time-helpers.spec.ts
│   ├── response-helpers.ts       # Response helper functions
│   ├── response-helpers.spec.ts
│   └── string-helpers.ts
├── ui/
│   ├── Button.svelte             # Shared UI components
│   ├── Button.spec.ts
│   ├── Input.svelte
│   ├── Input.spec.ts
│   ├── Select.svelte
│   └── Select.spec.ts
└── types/
    └── index.ts                   # Shared TypeScript types
```

#### Shared Helpers Example
```typescript
// src/shared/lib/time-helpers.ts
export function epochToDate(epoch: number): Date {
  return new Date(epoch);
}

export function dateToEpoch(date: Date): number {
  return date.getTime();
}

export function nowEpoch(): number {
  return Date.now();
}

export function formatEpoch(epoch: number, format: string): string {
  const date = new Date(epoch);
  
  switch (format) {
    case 'YYYY-MM-DD':
      return date.toISOString().split('T')[0];
    case 'HH:mm':
      return date.toTimeString().split(' ')[0].substring(0, 5);
    default:
      return date.toISOString();
  }
}
```

### 6. Widgets Layer

Reusable UI components that can be used across multiple features.

#### Structure
```
src/widgets/
├── task-card/
│   ├── TaskCard.svelte
│   └── TaskCard.spec.ts
├── task-list/
│   ├── TaskList.svelte
│   └── TaskList.spec.ts
├── priority-badge/
│   ├── PriorityBadge.svelte
│   └── PriorityBadge.spec.ts
└── offline-indicator/
    ├── OfflineIndicator.svelte
    └── OfflineIndicator.spec.ts
```

#### Widget Example
```svelte
<!-- src/widgets/task-card/TaskCard.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { isTaskOverdue } from '$entities/task/model/task';
  import PriorityBadge from './priority-badge/PriorityBadge.svelte';

  export let task: Task;

  const dispatch = createEventDispatcher();

  function handleComplete() {
    dispatch('complete', { taskId: task.id });
  }

  function handleDelete() {
    dispatch('delete', { taskId: task.id });
  }

  $: isOverdue = isTaskOverdue(task);
</script>

<div class="task-card" class:overdue={isOverdue}>
  <div class="task-header">
    <h3>{task.title}</h3>
    <PriorityBadge priority={task.priority} />
  </div>

  {#if task.description}
    <p class="task-description">{task.description}</p>
  {/if}

  <div class="task-meta">
    {#if task.dueDate}
      <span class="due-date">
        Due: {formatEpoch(task.dueDate, 'YYYY-MM-DD')}
      </span>
    {/if}
    <span class="status">{task.status}</span>
  </div>

  <div class="task-actions">
    <button on:click={handleComplete}>Complete</button>
    <button on:click={handleDelete}>Delete</button>
  </div>
</div>

<style>
  .task-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 8px;
  }

  .task-card.overdue {
    border-color: #ff6b6b;
    background-color: #fff5f5;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .task-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
</style>
```

## Vertical Slice Pattern

Each feature is organized as a vertical slice:

```
task-create/
├── model/     # Business logic
├── api/       # API integration
└── ui/        # UI components
```

### Benefits
- **Feature-focused development**
- **Easy to locate related code**
- **Independent feature testing**
- **Clear separation of concerns**
- **Easy to add/remove features**

## Component Interactions

### Frontend Request Flow

The frontend follows a layered request flow:

```
User Action → Component → Store → API Client → HTTP Request → Response Parser → State Update
                    ↓           ↓           ↓              ↓                 ↓
                 Validation  State Mgmt  Standard Format  Error Handling   UI Update
```

#### Layer Responsibilities

1. **Component Layer**
   - User interaction handling
   - UI rendering and updates
   - Event emission and handling
   - Form validation display

2. **Store Layer**
   - State management
   - Business logic implementation
   - State persistence (localStorage)
   - Reactivity management

3. **API Client Layer**
   - HTTP request construction
   - Authentication token management
   - Request/response interception
   - Error handling and retry logic

4. **HTTP Request Layer**
   - Network communication
   - Request/response handling
   - Timeout management
   - Retry logic for failed requests

5. **Response Parser Layer**
   - Standard response format parsing
   - Error extraction and handling
   - Data extraction and typing
   - Meta information processing

6. **State Update Layer**
   - Store state updates
   - Reactivity triggers
   - Component re-rendering
   - UI updates

### Offline Data Flow

The frontend supports offline operations with a dedicated data flow:

```
User Action → Component → IndexedDB → Optimistic UI → Sync Queue → Background Sync
                    ↓           ↓             ↓              ↓               ↓
                 Validation  Local Store   UI Update     Queue Mgmt     Network Monitor
```

#### Layer Responsibilities

1. **Component Layer**
   - User interaction handling
   - Offline status display
   - Form validation
   - Optimistic UI updates

2. **IndexedDB Layer**
   - Local data storage
   - Data retrieval and querying
   - Transaction management
   - Schema versioning

3. **Optimistic UI Layer**
   - Immediate UI updates
   - Error rollback on failure
   - Loading states management
   - Success/error feedback

4. **Sync Queue Layer**
   - Operation queuing
   - Queue ordering (FIFO)
   - Retry logic with backoff
   - Conflict detection

5. **Background Sync Layer**
   - Network status monitoring
   - Queue processing triggers
   - Batch operation optimization
   - Error handling and recovery

### Data Flow Examples

#### Task Creation Flow (Online)
```
User → Frontend → API Client → Backend API → PostgreSQL → Redis
                              ↓                              ↓
                         Priority Calc                   Cache
```

1. **User Action**: User fills task creation form
2. **Frontend Validation**: Frontend validates form using Zod schema
3. **API Request**: Frontend sends POST `/api/v1/tasks` with task data
4. **Backend Processing**: Backend validates, calculates priority, stores in database
5. **Cache Update**: Backend caches task in Redis
6. **Response**: Backend returns standardized response
7. **UI Update**: Frontend updates UI with new task

#### Task Creation Flow (Offline)
```
User → Frontend → IndexedDB → Sync Queue → API (when online)
```

1. **User Action**: User fills task creation form
2. **Frontend Validation**: Frontend validates form using Zod schema
3. **Local Storage**: Frontend stores task in IndexedDB
4. **Sync Queue**: Frontend adds task to sync queue
5. **UI Update**: Frontend updates UI with new task (optimistic)
6. **Network Monitor**: Service Worker monitors network status
7. **Online Detection**: When connection restored, sync triggers
8. **Queue Processing**: Frontend processes sync queue
9. **API Sync**: Frontend sends queued tasks to API
10. **ID Update**: Backend returns server IDs, frontend updates local data

## Best Practices

1. **Feature First**: Organize by feature, not by type
2. **Shared Abstraction**: Use shared layer for common utilities
3. **Type Safety**: Use TypeScript strict mode
4. **Component Reusability**: Use widgets for reusable components
5. **State Management**: Use Svelte stores for feature state
6. **API Layer**: Centralize API calls in feature/api
7. **Validation**: Use Zod for runtime validation
8. **Testing**: Test each layer independently
