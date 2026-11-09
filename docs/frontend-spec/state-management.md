# State Management

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the client-side data flow, state management patterns, and hydration rules for the Advanced Task Manager frontend.

---

## State Management Strategy

### Svelte Stores

**Primary State Management:** Svelte stores

**Why Svelte Stores:**
- Built-in to Svelte
- Simple and intuitive
- Reactive by default
- No external dependencies
- Excellent TypeScript support

### Store Types

**Writable Stores:**
```typescript
import { writable } from 'svelte/store';

const count = writable(0);

// Read
count.subscribe(value => console.log(value));

// Write
count.set(1);
count.update(n => n + 1);
```

**Readable Stores:**
```typescript
import { readable } from 'svelte/store';

const time = readable(new Date(), set => {
  const interval = setInterval(() => set(new Date()), 1000);
  return () => clearInterval(interval);
});
```

**Derived Stores:**
```typescript
import { derived } from 'svelte/store';

const doubled = derived(count, $count => $count * 2);
```

**Custom Stores:**
```typescript
function createCounter() {
  const { subscribe, set, update } = writable(0);

  return {
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(0),
  };
}

export const counter = createCounter();
```

---

## Client-Side Data Flow

### Data Flow Architecture

```
User Action → Component → Store → API Client → HTTP Request → Response Parser → State Update
                    ↓           ↓           ↓              ↓                 ↓
                 Validation  State Mgmt  Standard Format  Error Handling   UI Update
```

### Layer Responsibilities

**Component Layer:**
- User interaction handling
- UI rendering and updates
- Event emission and handling
- Form validation display

**Store Layer:**
- State management
- Business logic implementation
- State persistence (localStorage)
- Reactivity management

**API Client Layer:**
- HTTP request construction
- Authentication token management
- Request/response interception
- Error handling and retry logic

**HTTP Request Layer:**
- Network communication
- Request/response handling
- Timeout management
- Retry logic for failed requests

**Response Parser Layer:**
- Standard response format parsing
- Error extraction and handling
- Data extraction and typing
- Meta information processing

### Standard Response Format

All API responses follow the standard response format defined in [Standard Response Format](../api-specs/standard-response-format.md).

For error codes and their meanings, refer to [Error Codes](../api-specs/error-codes.md).

**State Update Layer:**
- Store state updates
- Reactivity triggers
- Component re-rendering
- UI updates

---

## Feature-Level State

### Task Feature State

**Task List Store:**
```typescript
import { writable, derived } from 'svelte/store';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: number | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface TaskListState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: {
    status: string | null;
    priority: string | null;
    search: string;
  };
}

function createTaskListStore() {
  const state = writable<TaskListState>({
    tasks: [],
    loading: false,
    error: null,
    filter: {
      status: null,
      priority: null,
      search: '',
    },
  });

  const filteredTasks = derived(state, $state => {
    let tasks = $state.tasks;

    if ($state.filter.status) {
      tasks = tasks.filter(t => t.status === $state.filter.status);
    }

    if ($state.filter.priority) {
      tasks = tasks.filter(t => t.priority === $state.filter.priority);
    }

    if ($state.filter.search) {
      const search = $state.filter.search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    return tasks;
  });

  async function loadTasks() {
    state.update(s => ({ ...s, loading: true, error: null }));

    try {
      const response = await fetch('/api/v1/tasks');
      const data = await response.json();

      if (data.status.is_success) {
        state.update(s => ({ ...s, tasks: data.data, loading: false }));
      } else {
        // Error message from standard response format
        state.update(s => ({ ...s, error: data.status.message, loading: false }));
      }
    } catch (error) {
      state.update(s => ({ ...s, error: 'Failed to load tasks', loading: false }));
    }
  }

  function setFilter(filter: Partial<TaskListState['filter']>) {
    state.update(s => ({
      ...s,
      filter: { ...s.filter, ...filter },
    }));
  }

  return {
    subscribe: state.subscribe,
    filteredTasks,
    loadTasks,
    setFilter,
  };
}

export const taskListStore = createTaskListStore();
```

### Auth Feature State

**Auth Store:**
```typescript
import { writable, derived } from 'svelte/store';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

function createAuthStore() {
  const state = writable<AuthState>({
    user: null,
    token: null,
    loading: false,
    error: null,
  });

  const isAuthenticated = derived(state, $state => !!$state.user);

  // Load from localStorage on init
  function init() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      state.update(s => ({
        ...s,
        token,
        user: JSON.parse(user),
      }));
    }
  }

  async function loginWithGoogle() {
    state.update(s => ({ ...s, loading: true, error: null }));

    try {
      // Redirect to Google OAuth
      window.location.href = '/api/v1/auth/google';
    } catch (error) {
      state.update(s => ({ ...s, error: 'Failed to login', loading: false }));
    }
  }

  async function logout() {
    state.update(s => ({ ...s, loading: true, error: null }));

    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });

      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

      state.update(s => ({
        ...s,
        user: null,
        token: null,
        loading: false,
      }));
    } catch (error) {
      state.update(s => ({ ...s, error: 'Failed to logout', loading: false }));
    }
  }

  return {
    subscribe: state.subscribe,
    isAuthenticated,
    init,
    loginWithGoogle,
    logout,
  };
}

export const authStore = createAuthStore();
```

---

## Global State

### App-Level State

**Theme Store:**
```typescript
import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

function createThemeStore() {
  const theme = writable<Theme>('light');

  // Load from localStorage
  function init() {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) {
      theme.set(saved);
    }
  }

  function toggle() {
    theme.update(t => {
      const newTheme = t === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  }

  return {
    subscribe: theme.subscribe,
    init,
    toggle,
  };
}

export const themeStore = createThemeStore();
```

---

## Hydration Rules

### Server-Side Data Loading

**SvelteKit Load Function:**
```typescript
// src/pages/tasks/list/+page.ts
export async function load({ fetch }) {
  const response = await fetch('/api/v1/tasks');
  const data = await response.json();

  if (data.status.is_success) {
    return {
      tasks: data.data,
    };
  } else {
    // Handle error from standard response format
    return {
      tasks: [],
    };
  }
}
```

### Client-Side Hydration

**Hydrate Store with Server Data:**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { taskListStore } from './model/task-list.store';

  export let data;

  onMount(() => {
    taskListStore.setTasks(data.tasks);
  });
</script>
```

### Data Refresh Strategy

**Refresh on Visibility Change:**
```typescript
import { onMount, onDestroy } from 'svelte';

onMount(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      taskListStore.loadTasks();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
});
```

---

## Offline State

### IndexedDB Integration

**Offline Store:**
```typescript
import { openDB } from 'idb';

const DB_NAME = 'taskmanager';
const DB_VERSION = 1;

async function openDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    },
  });
}

async function saveTaskOffline(task: Task) {
  const db = await openDatabase();
  await db.put('tasks', task);
}

async function loadTasksOffline() {
  const db = await openDatabase();
  return db.getAll('tasks');
}
```

### Sync Queue

**Sync Queue Store:**
```typescript
interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: Task;
  timestamp: number;
}

function createSyncQueueStore() {
  const queue = writable<SyncOperation[]>([]);

  async function enqueue(operation: SyncOperation) {
    queue.update(q => [...q, operation]);

    // Save to IndexedDB
    const db = await openDatabase();
    await db.put('syncQueue', operation);
  }

  async function processQueue() {
    const operations = get(queue);

    for (const op of operations) {
      try {
        await syncOperation(op);
        queue.update(q => q.filter(item => item.id !== op.id));
      } catch (error) {
        console.error('Failed to sync operation:', error);
      }
    }
  }

  return {
    subscribe: queue.subscribe,
    enqueue,
    processQueue,
  };
}

export const syncQueueStore = createSyncQueueStore();
```

---

## References

- [Frontend Technical Design](./README.md) - Frontend architecture overview
- [Svelte Stores Documentation](https://svelte.dev/docs#run-time-svelte-store) - Svelte stores documentation
- [IndexedDB Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - IndexedDB documentation
