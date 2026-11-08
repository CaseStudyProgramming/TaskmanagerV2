# Frontend Technical Design

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the frontend technical design, technology stack, architecture patterns, and coding standards for the Advanced Task Manager project.

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | SvelteKit | 1.20+ | Frontend framework |
| **Language** | TypeScript | 5.0+ | Type-safe JavaScript |
| **Runtime** | Bun | 1.0+ | JavaScript runtime |
| **Package Manager** | Bun | 1.0+ | Dependency management |
| **Architecture** | FSD + Vertical Slices | - | Feature-Sliced Design pattern |
| **Styling** | Tailwind CSS | 3.3+ | Utility-first CSS |
| **Validation** | Zod | 3.22+ | Runtime validation |
| **Build Tool** | Bun build | - | Build tool via SvelteKit |
| **Code Quality** | Biome.js | 1.0+ | Linting and formatting |
| **Testing** | Vitest | 1.0+ | Unit testing |
| **E2E Testing** | Playwright | 1.40+ | End-to-end testing |
| **Deployment** | Cloudflare Workers | - | Edge deployment |
| **Adapter** | @sveltejs/adapter-cloudflare | - | Cloudflare adapter |

### External Services

| Service | Technology | Purpose |
|---------|------------|---------|
| **API** | Backend API (Go) | RESTful API backend |
| **Auth** | Google OAuth 2.0 | User authentication |
| **CDN** | Cloudflare CDN | Static asset delivery |
| **Edge** | Cloudflare Workers | Edge functions |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Bun** | Package manager and runtime |
| **Biome** | Linting and formatting |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **TypeScript** | Type checking |
| **SvelteKit Dev** | Development server |

---

## Architecture Patterns

### Feature-Sliced Design (FSD)

The frontend follows FSD principles with clear separation across app, pages, features, entities, shared, and widgets layers.

#### Layer Structure

```
src/
├── app/                 # App layer (global configuration)
│   ├── providers/       # Global providers
│   ├── routes/          # Route configuration
│   ├── styles/          # Global styles
│   └── store/           # Global state
├── pages/               # Pages layer (route components)
│   ├── home/
│   ├── auth/
│   └── tasks/
├── features/            # Features layer (business logic)
│   ├── task-create/
│   ├── task-edit/
│   ├── task-delete/
│   ├── task-filter/
│   ├── task-prioritize/
│   ├── auth-google/
│   ├── export-import/
│   └── offline-sync/
├── entities/            # Entities layer (domain models)
│   ├── task/
│   ├── user/
│   └── auth/
├── shared/              # Shared layer (utilities)
│   ├── api/
│   ├── config/
│   ├── lib/
│   ├── ui/
│   ├── segments/
│   └── types/
└── widgets/             # Widgets layer (reusable components)
    ├── task-card/
    ├── task-list/
    ├── priority-badge/
    └── offline-indicator/
```

### Vertical Slice Pattern

Vertical slices are applied within the FSD layers to ensure feature-focused organization:

**Feature Vertical Slice:**
```
task-create/
├── model/              # State management and business logic
│   ├── task-create.store.ts
│   ├── task-create.store.spec.ts
│   └── task-create.schema.ts
├── api/                # API integration
│   ├── task-create.api.ts
│   └── task-create.api.spec.ts
└── ui/                 # UI components
    ├── TaskCreateForm.svelte
    └── TaskCreateForm.spec.ts
```

**Benefits:**
- Feature-focused development
- Easy to locate related code
- Independent feature testing
- Clear separation of concerns
- Easy to add/remove features

---

## Directory Conventions

### Project Structure

```
frontend/
├── src/                     # Source code
│   ├── app/                 # App layer
│   ├── pages/               # Pages layer
│   ├── features/            # Features layer
│   ├── entities/            # Entities layer
│   ├── shared/              # Shared layer
│   └── widgets/             # Widgets layer
├── static/                  # Static assets
├── tests/                   # E2E tests
├── svelte.config.js         # Svelte configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
├── biome.json               # Biome configuration
├── package.json             # Dependencies
├── bun.lockb                # Lock file
└── wrangler.toml            # Cloudflare Workers config
```

### File Naming Conventions

| File Type | Convention | Example |
|-----------|------------|---------|
| **Svelte components** | PascalCase.svelte | `TaskCard.svelte` |
| **TypeScript files** | kebab-case.ts | `task-create.store.ts` |
| **Test files** | kebab-case.spec.ts | `task-create.store.spec.ts` |
| **Type files** | types.ts | `types.ts` |
| **Config files** | filename.config.ext | `tailwind.config.js` |

---

## Coding Standards

### TypeScript Code Style

**Formatting:**
- Use Biome for all code formatting
- Run `biome check --write .` before committing
- Use strict TypeScript mode

**Naming:**
- Components: PascalCase
- Functions: camelCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase
- Files: kebab-case

**Comments:**
- Document public APIs with JSDoc
- Comment on "why", not "what"
- Keep comments concise and accurate

**Type Safety:**
- Use TypeScript strict mode
- Avoid `any` type
- Use type inference where possible
- Use union types for variants

### Example Code

**Component Example:**
```svelte
<script lang="ts">
  import { taskCreateStore } from './model/task-create.store';
  import { taskSchema } from './model/task-create.schema';

  const store = taskCreateStore();

  async function handleSubmit() {
    const validation = taskSchema.safeParse(store.form);

    if (!validation.success) {
      store.setErrors(validation.error.errors);
      return;
    }

    await store.createTask();
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input type="text" bind:value={store.form.title} />
  {#if store.errors.title}
    <span class="error">{store.errors.title}</span>
  {/if}
  <button type="submit">Create Task</button>
</form>
```

**Store Example:**
```typescript
import { writable, derived } from 'svelte/store';

interface TaskForm {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: number | null;
  tags: string[];
}

interface TaskFormErrors {
  title?: string;
  description?: string;
  priority?: string;
}

function createTaskCreateStore() {
  const form = writable<TaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null,
    tags: [],
  });

  const errors = writable<TaskFormErrors>({});
  const loading = writable(false);

  async function createTask() {
    loading.set(true);
    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(get(form)),
      });
      const data = await response.json();
      // Handle response
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      loading.set(false);
    }
  }

  return {
    form,
    errors,
    loading,
    createTask,
  };
}

export const taskCreateStore = createTaskCreateStore();
```

---

## Rendering Strategy

### Server-Side Rendering (SSR)

**Strategy:** Hybrid SSR + Client-Side Hydration

**Why SSR:**
- Better SEO (if needed in future)
- Faster initial page load
- Better perceived performance
- Improved accessibility

**When to use SSR:**
- Public pages (home, marketing)
- First page load
- SEO-critical pages

**When to use CSR:**
- Authenticated pages
- Complex interactive features
- Real-time data updates

### Static Site Generation (SSG)

**Strategy:** Pre-render static pages at build time

**Use Cases:**
- Marketing pages
- Documentation
- Landing pages

**Configuration:**
```javascript
// svelte.config.js
export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true,
    }),
  },
};
```

---

## State Management

### Client-Side Data Flow

**Svelte Stores:**
- Use Svelte stores for feature-level state
- Use derived stores for computed values
- Use custom stores for complex logic

**State Layers:**
```
Component Layer (UI State)
    ↓
Feature Layer (Business Logic)
    ↓
Entity Layer (Domain State)
    ↓
Shared Layer (Global State)
```

### Hydration Rules

**Hydration Strategy:**
- Load initial data from server (SSR)
- Hydrate client-side stores with server data
- Update state via API calls
- Persist critical state to localStorage

**Example:**
```typescript
// Load tasks on page load
export async function load({ fetch }) {
  const response = await fetch('/api/v1/tasks');
  const tasks = await response.json();
  return { tasks };
}

// Hydrate store in component
<script lang="ts">
  import { onMount } from 'svelte';
  import { tasksStore } from './model/tasks.store';

  export let data;

  onMount(() => {
    tasksStore.set(data.tasks);
  });
</script>
```

---

## API Integration

### API Client

**Shared API Client:**
```typescript
// shared/api/client.ts
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient('https://api.davidcps.my.id');
```

### Response Handling

**Standard Response Parser:**
```typescript
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

function extractData<T>(response: StandardResponse<T>): T {
  if (!response.status.is_success) {
    throw new Error(response.status.message);
  }
  return response.data;
}
```

---

## Quality Standards

### Performance Requirements

- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.5s
- Cumulative Layout Shift (CLS) < 0.1

### Code Quality

- Code coverage > 80% (unit tests)
- Code coverage > 70% (E2E tests)
- Zero critical linting errors
- Zero TypeScript errors

### Testing Strategy

**Unit Tests:**
- Test component logic in isolation
- Mock external dependencies
- Test edge cases and error conditions
- Use Vitest for testing

**E2E Tests:**
- Test complete user flows
- Test with real browser (Chromium, Firefox, WebKit)
- Run in CI/CD pipeline
- Use Playwright for testing

---

## Deployment

### Cloudflare Workers Configuration

**SvelteKit Adapter:**
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      platformProxy: {
        pages: true,
      },
    }),
  },
};
```

**Wrangler Configuration:**
```toml
name = "taskmanager-frontend"
main = "./.cloudflare/_worker.js"
compatibility_date = "2024-01-01"

[site]
bucket = "./.cloudflare/public"

[build]
command = "bun run build"
cwd = "."
watch_dir = "src"

[vars]
ENVIRONMENT = "production"
API_URL = "https://api.davidcps.my.id"
```

### CI/CD Pipeline

**Forgejo Actions Workflow:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Lint
        run: bun run lint

      - name: Type check
        run: bun run typecheck

      - name: Build
        run: bun run build

      - name: Test
        run: bun run test

      - name: E2E Test
        run: bun run test:e2e
```

---

## References

- [Frontend FSD Architecture](../tdd/architecture/frontend-fsd.md) - Detailed FSD implementation
- [State Management](./state-management.md) - State management patterns
- [Design System & UI](./design-system-&-ui.md) - UI component design
- [Routing & Middleware](./routing-&-middleware.md) - Routing configuration
- [Frontend Quality & Reliability](../tdd/quality-reliability/frontend-quality-reliability.md) - Quality requirements
